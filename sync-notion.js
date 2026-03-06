import { Client } from '@notionhq/client';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';

dotenv.config();

const notion = new Client({ auth: process.env.NOTION_KEY });
const databaseId = process.env.NOTION_DATABASE_ID;

const publicProjectsDir = path.join(process.cwd(), 'public', 'projects');

// Ensure the directory exists
if (!fs.existsSync(publicProjectsDir)) {
    fs.mkdirSync(publicProjectsDir, { recursive: true });
}

// Helper to download images
function downloadImage(url, filename) {
    return new Promise((resolve, reject) => {
        if (!url) {
            resolve(null);
            return;
        }

        const filepath = path.join(publicProjectsDir, filename);

        // if the file already exists, we could skip it, but for fresh sync let's overwrite
        const file = fs.createWriteStream(filepath);
        const client = url.startsWith('https') ? https : http;

        client.get(url, (response) => {
            if (response.statusCode === 200) {
                response.pipe(file);
                file.on('finish', () => {
                    file.close();
                    resolve(`/projects/${filename}`);
                });
            } else {
                file.close();
                fs.unlink(filepath, () => { }); // Delete temp file
                console.warn(`Failed to download image: ${url} (Status: ${response.statusCode})`);
                resolve(url); // Fallback to original URL
            }
        }).on('error', (err) => {
            file.close();
            fs.unlink(filepath, () => { });
            console.error(`Error downloading image ${url}:`, err.message);
            resolve(url); // Fallback to original URL
        });
    });
}

function extractRichText(richTextArray) {
    if (!richTextArray || !Array.isArray(richTextArray)) return "";
    return richTextArray.map(rt => rt.plain_text).join("").trim();
}

function extractRollup(rollupObj) {
    if (!rollupObj || rollupObj.type !== 'rollup') return "";

    const rollup = rollupObj.rollup;
    if (rollup.type === 'array') {
        // Rollup array might contain title, rich_text, select, etc.
        const parts = rollup.array.map(item => {
            if (item.type === 'title') return extractRichText(item.title);
            if (item.type === 'rich_text') return extractRichText(item.rich_text);
            if (item.type === 'select' && item.select) return item.select.name;
            if (item.type === 'multi_select') return item.multi_select.map(s => s.name).join(', ');
            return "";
        }).filter(Boolean);
        return parts.join(', ');
    } else if (rollup.type === 'date' && rollup.date) {
        return rollup.date.start;
    }
    return "";
}

async function extractRelationTitle(relationObj) {
    if (!relationObj || relationObj.type !== 'rollup') return "";

    // Sometimes it's a rollup and sometimes just an array
    const rollup = relationObj.rollup;
    if (rollup && rollup.type === 'array') {
        const item = rollup.array[0];
        if (item && item.type === 'relation' && item.relation.length > 0) {
            const relatedPageId = item.relation[0].id;
            try {
                const response = await notion.pages.retrieve({ page_id: relatedPageId });
                // We assume the title property of the related DB is always 'Name' or 'Title'
                // Usually it's 'Name' by default in Notion relations, or the first title property
                const titleKey = Object.keys(response.properties).find(k => response.properties[k].type === 'title');
                if (titleKey) {
                    return extractRichText(response.properties[titleKey].title);
                }
            } catch (err) {
                console.warn("Could not retrieve related page: " + relatedPageId);
            }
        }
    }
    return "";
}

async function syncNotion() {
    console.log("Starting Notion sync...");
    try {
        const response = await notion.databases.query({
            database_id: databaseId,
        });

        const projects = [];

        for (const page of response.results) {
            const props = page.properties;

            // Extract basic fields
            const id = page.id;
            let title = props.Project && props.Project.title ? extractRichText(props.Project.title) : "Untitled";

            // If title is effectively empty and no other key data, we might want to skip mostly empty rows
            // But let's export them anyway for fidelity, or maybe skip them if absolutely empty.
            if (!title) {
                title = "Untitled";
            }


            const description = extractRichText(props.Description?.rich_text);
            const brand = await extractRelationTitle(props.Brand);
            const location = await extractRelationTitle(props.Location);
            const date = extractRollup(props.Date);

            // Project Type Mapping
            const rawCategory = extractRollup(props['Project Type']);
            const typeMapping = {
                'V': 'Visual Communications',
                'I': 'Interior Design',
                'E': 'Exhibition Design'
            };
            const category = typeMapping[rawCategory] || rawCategory;

            const role = props.Role && props.Role.multi_select
                ? props.Role.multi_select.map(r => r.name).join(", ")
                : "";

            // User requested exactly these fields. We can pull Market if available 
            // but the user only explicitly requested the above + Market. 
            // In the Notion schema Market is not natively present based on our check. 
            // If they added it we can try to pull it, otherwise default it.
            const market = props.Market ? extractRollup(props.Market) : "N/A";

            console.log(`Processing project: ${title} (${category})`);

            const getUrl = (propName) => {
                const prop = props[propName];
                if (!prop) return "";
                if (prop.type === 'url') return prop.url || "";
                if (prop.type === 'files' && prop.files && prop.files.length > 0) {
                    const fileObj = prop.files[0];
                    if (fileObj.type === 'file') return fileObj.file.url;
                    if (fileObj.type === 'external') return fileObj.external.url;
                }
                return "";
            };

            // Gather image URLs
            const heroUrl = getUrl('Hero Photo');
            const thumbUrl = getUrl('Support Photo 1');
            const support2Url = getUrl('Support Photo 2');
            const detail1Url = getUrl('Detail Photo 1');
            const detail2Url = getUrl('Detail Photo 2');

            // Download images
            // To ensure uniqueness and valid filenames, we append id and role
            const safeTitle = title.replace(/[^a-z0-9]/gi, '-').toLowerCase();

            const heroImage = heroUrl ? await downloadImage(heroUrl, `${safeTitle}-${id}-hero.jpg`) : "";
            const thumbnail = thumbUrl ? await downloadImage(thumbUrl, `${safeTitle}-${id}-thumb.jpg`) : "";

            const images = [];
            if (support2Url) images.push(await downloadImage(support2Url, `${safeTitle}-${id}-support2.jpg`));
            if (detail1Url) images.push(await downloadImage(detail1Url, `${safeTitle}-${id}-detail1.jpg`));
            if (detail2Url) images.push(await downloadImage(detail2Url, `${safeTitle}-${id}-detail2.jpg`));

            projects.push({
                id: `${safeTitle}-${id}`,
                title,
                category,
                brand,
                location,
                date,
                market,
                role,
                thumbnail,
                heroImage,
                description,
                images: images.filter(Boolean)
            });
        }

        // Write to projects.js
        const jsContent = `// AUTO-GENERATED FILE. DO NOT EDIT DIRECTLY.
// Generated from Notion database on ${new Date().toISOString()}

export const projectsData = ${JSON.stringify(projects, null, 4)};\n`;

        const outputPath = path.join(process.cwd(), 'src', 'data', 'projects.js');
        fs.writeFileSync(outputPath, jsContent, 'utf-8');
        console.log(`Successfully synced ${projects.length} projects to ${outputPath}`);
        console.log("Remember to verify the fields generated in src/data/projects.js");

    } catch (error) {
        console.error("Error during Notion sync:", error);
    }
}

syncNotion();
