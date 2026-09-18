const fs = require('fs');
const path = require('path');

const MODIFIERS = {
    'conejita': 'bunny_suit',
    'coneja': 'bunny_suit',
    'bunny': 'bunny_suit',
    'traje de bano': 'swimsuit',
    'traje de baño': 'swimsuit',
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

// Palabras de relleno en español que jamás deben enviarse como tags
const STOPWORDS_REGEX = /\b(vestida|vestido|disfrazada|disfrazado|disfraz|traje|ropa|en|con|de|del|el|la|los|las|un|una|unos|unas|por|para)\b/gi;

let franchises = [];
let characters = [];

function loadDatabases() {
    const franchisesPath = path.join(__dirname, '../../data/franchises.csv');
    const charactersPath = path.join(__dirname, '../../data/characters.csv');

    franchises = [];
    characters = [];

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
    }

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
    }

    console.log(`[TagManager] Base de datos cargada: ${franchises.length} franquicias,${characters.length} personajes.`);
}

function resolveSearchQuery(cleanQuery) {
    let query = cleanQuery.toLowerCase();
    const finalTags = [];
    let hasCharacter = false;

    // 1. Detectar franquicia
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

    // 2. Buscar candidatos a personaje
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

    // 3. Resolver personaje
    if (candidateMatches.length > 0) {
        candidateMatches.sort((a, b) => {
            if (b.aliasLength !== a.aliasLength) return b.aliasLength - a.aliasLength;
            return b.popularity - a.popularity;
        });

        let selected = matchedFranchiseTag 
            ? candidateMatches.find(c => c.franchiseTag === matchedFranchiseTag) 
            : candidateMatches[0];

        if (!selected) selected = candidateMatches[0];

        finalTags.push(selected.charTag);
        hasCharacter = true;
        const cleanRegex = new RegExp(`\\b${selected.aliasText}\\b`, 'gi');
        query = query.replace(cleanRegex, ' ');
    }

    // 4. Modificadores de vestimenta
    for (const [modifier, tag] of Object.entries(MODIFIERS)) {
        const regex = new RegExp(`\\b${modifier}\\b`, 'gi');
        if (regex.test(query)) {
            finalTags.push(tag);
            query = query.replace(regex, ' ');
        }
    }

    // 5. Eliminar palabras de relleno
    query = query.replace(STOPWORDS_REGEX, ' ');

    // 6. Palabras residuales no reconocidas
    const remainingWords = query.trim().split(/\s+/).filter(w => w.length > 1);

    return {
        resolvedTags: [...new Set(finalTags)].join(' '),
        hasCharacter: hasCharacter,
        unresolvedWords: remainingWords.join(' ')
    };
}

loadDatabases();

module.exports = { resolveSearchQuery, loadDatabases };