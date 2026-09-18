const fs = require('fs');
const path = require('path');

const MODIFIERS = {
    'conejita': 'bunny_suit',
    'coneja': 'bunny_suit',
    'bunny': 'bunny_suit',
    'traje de bano': 'swimsuit',
    'bikini': 'bikini',
    'playa': 'beach swimsuit',
    'escolar': 'school_uniform',
    'colegiala': 'school_uniform',
    'sirvienta': 'maid',
    'maid': 'maid',
    'enfermera': 'nurse',
    'navidad': 'santa_costume',
    'vestido': 'dress',
    'gato': 'cat_ears',
    'neko': 'cat_ears'
};

let franchises = [];
let characters = [];

function loadDatabases() {
    const franchisesPath = path.join(__dirname, '../../data/franchises.csv');
    const charactersPath = path.join(__dirname, '../../data/characters.csv');

    franchises = [];
    characters = [];

    // 1. Cargar Franquicias
    if (fs.existsSync(franchisesPath)) {
        const content = fs.readFileSync(franchisesPath, 'utf-8');
        const rows = content.split(/\r?\n/).filter(line => line.trim().length > 0).slice(1);
        
        for (const row of rows) {
            const [tagFranchise, aliasFranchise, popularity] = row.split(',').map(s => s?.trim());
            if (!tagFranchise) continue;

            franchises.push({
                tag: tagFranchise,
                aliases: aliasFranchise ? aliasFranchise.toLowerCase().split('|').filter(Boolean) : [tagFranchise.toLowerCase()],
                popularity: parseInt(popularity, 10) || 0
            });
        }
    } else {
        console.warn('franchises.csv no encontrado en data/');
    }

    // 2. Cargar Personajes
    if (fs.existsSync(charactersPath)) {
        const content = fs.readFileSync(charactersPath, 'utf-8');
        const rows = content.split(/\r?\n/).filter(line => line.trim().length > 0).slice(1);
        
        for (const row of rows) {
            const [charTag, charAliases, popularity, franchiseTag] = row.split(',').map(s => s?.trim());
            if (!charTag) continue;

            characters.push({
                tag: charTag,
                aliases: charAliases ? charAliases.toLowerCase().split('|').filter(Boolean) : [],
                popularity: parseInt(popularity, 10) || 0,
                franchiseTag: franchiseTag || ''
            });
        }
    } else {
        console.warn('characters.csv no encontrado en data/');
    }

    console.log(`[TagManager] Cargadas ${franchises.length} franquicias y ${characters.length} personajes.`);
}

function resolveSearchQuery(cleanQuery) {
    let query = cleanQuery.toLowerCase();
    const finalTags = [];

    // 1. Detectar si el usuario especificó una franquicia (ej: "de card captor", "de csm")
    let matchedFranchiseTag = null;
    for (const f of franchises) {
        for (const alias of f.aliases) {
            const regex = new RegExp(`\\b${alias}\\b`, 'gi');
            if (regex.test(query)) {
                matchedFranchiseTag = f.tag;
                finalTags.push(f.tag);
                query = query.replace(regex, ' ');
                break;
            }
        }
        if (matchedFranchiseTag) break;
    }

    // 2. Buscar personajes candidatos que coincidan con los alias
    const candidateMatches = [];
    for (const c of characters) {
        for (const alias of c.aliases) {
            const regex = new RegExp(`\\b${alias}\\b`, 'gi');
            if (regex.test(query)) {
                candidateMatches.push({
                    aliasLength: alias.length,
                    aliasText: alias,
                    charTag: c.tag,
                    franchiseTag: c.franchiseTag,
                    popularity: c.popularity
                });
            }
        }
    }

    // 3. Aplicar jerarquía de resolución
    if (candidateMatches.length > 0) {
        // Ordenar por longitud de alias (nombres compuestos ganan) y luego por popularidad
        candidateMatches.sort((a, b) => {
            if (b.aliasLength !== a.aliasLength) {
                return b.aliasLength - a.aliasLength;
            }
            return b.popularity - a.popularity;
        });

        let selected = null;

        // Si el usuario especificó una franquicia, buscar un personaje que pertenezca a ella
        if (matchedFranchiseTag) {
            selected = candidateMatches.find(c => c.franchiseTag === matchedFranchiseTag);
        }

        // Si no se especificó franquicia o no hubo coincidencia estricta, elegir el más popular globalmente
        if (!selected) {
            selected = candidateMatches[0];
        }

        finalTags.push(selected.charTag);

        // Limpiar el alias encontrado de la consulta
        const cleanRegex = new RegExp(`\\b${selected.aliasText}\\b`, 'gi');
        query = query.replace(cleanRegex, ' ');
    }

    // 4. Procesar modificadores de vestimenta y situaciones
    for (const [modifier, tag] of Object.entries(MODIFIERS)) {
        const regex = new RegExp(`\\b${modifier}\\b`, 'gi');
        if (regex.test(query)) {
            finalTags.push(tag);
            query = query.replace(regex, ' ');
        }
    }

    // 5. Términos residuales restantes
    const residuals = query.trim().split(/\s+/).filter(w => w.length > 1 && w !== 'de');
    return [...new Set([...finalTags, ...residuals])].join(' ');
}

// Carga inicial al arrancar
loadDatabases();

module.exports = { resolveSearchQuery, loadDatabases };