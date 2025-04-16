#!/usr/bin/env node

import { Command } from 'commander';
import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';
import JournalDatabaseService from '../services/journal-database.service';
import NLMCatalogService from '../services/nlm-catalog.service';
import { Logger } from '../utils/logger';

// Load environment variables
dotenv.config();

const program = new Command();
const journalDbService = new JournalDatabaseService();
const nlmCatalogService = new NLMCatalogService();

// Initialize the CLI
async function init() {
  try {
    await journalDbService.initialize();
    
    program
      .name('journal-manager')
      .description('CLI tool for managing the journal database')
      .version('1.0.0');
    
    // Search journals in NLM Catalog
    program
      .command('search')
      .description('Search for journals in the NLM Catalog')
      .argument('<query>', 'Search query')
      .option('-m, --medline', 'Only journals indexed in MEDLINE')
      .option('-p, --pmc', 'Only journals in PubMed Central')
      .option('-c, --current', 'Only currently indexed journals', true)
      .action(async (query: string, options: { medline?: boolean; pmc?: boolean; current?: boolean }) => {
        try {
          console.log(`Searching for journals matching "${query}"...`);
          
          const journals = await nlmCatalogService.searchJournals(query, {
            medline: options.medline || false,
            pubmedCentral: options.pmc || false,
            currentlyIndexed: options.current || true
          });
          
          console.log(`Found ${journals.length} journals matching "${query}"`);
          journals.forEach(journal => {
            console.log(`- ${journal.title} (${journal.nlm_id})`);
            if (journal.medline_abbr) {
              console.log(`  Medline Abbr: ${journal.medline_abbr}`);
            }
            if (journal.issns && journal.issns.length > 0) {
              console.log(`  ISSNs: ${journal.issns.join(', ')}`);
            }
          });
        } catch (error) {
          console.error('Error searching journals:', error);
        }
      });
    
    // Update journal database from NLM Catalog
    program
      .command('update')
      .description('Update the journal database from NLM Catalog')
      .argument('[query]', 'Optional search query to limit journals to update')
      .action(async (query?: string) => {
        try {
          console.log(`Updating journal database${query ? ` with query: ${query}` : ''}...`);
          
          const count = await journalDbService.updateJournalDatabase(query);
          console.log(`Updated ${count} journals in the database`);
        } catch (error) {
          console.error('Error updating journal database:', error);
        }
      });
    
    // Import journals from static JSON file
    program
      .command('import')
      .description('Import journals from a static JSON file')
      .argument('<file>', 'Path to JSON file with journals array')
      .action(async (file: string) => {
        try {
          const filePath = path.resolve(file);
          console.log(`Importing journals from ${filePath}...`);
          
          // Check if file exists
          try {
            await fs.access(filePath);
          } catch (error) {
            console.error(`Error: File ${filePath} does not exist or cannot be accessed`);
            return;
          }
          
          const count = await journalDbService.importJournalsFromFile(filePath);
          console.log(`Imported ${count} journals from ${filePath}`);
        } catch (error) {
          console.error('Error importing journals:', error);
        }
      });
    
    // Map journals to specialties
    program
      .command('map-specialty')
      .description('Map journals to a specialty')
      .argument('<specialty>', 'Specialty name')
      .argument('<query>', 'Query to find journals for the specialty')
      .action(async (specialty: string, query: string) => {
        try {
          console.log(`Mapping journals matching "${query}" to specialty "${specialty}"...`);
          
          const journals = await nlmCatalogService.searchJournals(query);
          const count = await journalDbService.updateSpecialtyJournals(specialty, journals);
          console.log(`Mapped ${count} journals to specialty "${specialty}"`);
        } catch (error) {
          console.error('Error mapping journals to specialty:', error);
        }
      });
    
    // List available specialties
    program
      .command('list-specialties')
      .description('List all available specialties')
      .action(async () => {
        try {
          const specialties = journalDbService.getAvailableSpecialties();
          
          if (specialties.length === 0) {
            console.log('No specialties available. Use map-specialty to create specialty mappings.');
            return;
          }
          
          console.log(`Available specialties (${specialties.length}):`);
          specialties.forEach(specialty => {
            const journals = journalDbService.getJournalsBySpecialty(specialty);
            console.log(`- ${specialty} (${journals.length} journals)`);
          });
        } catch (error) {
          console.error('Error listing specialties:', error);
        }
      });
    
    // Find journals by name
    program
      .command('find')
      .description('Find journals by name in the database')
      .argument('<name>', 'Journal name to search for')
      .action(async (name: string) => {
        try {
          const journals = journalDbService.findJournalsByName(name);
          
          if (journals.length === 0) {
            console.log(`No journals found matching "${name}"`);
            return;
          }
          
          console.log(`Found ${journals.length} journals matching "${name}":`);
          journals.forEach(journal => {
            console.log(`- ${journal.title} (${journal.nlm_id})`);
            if (journal.medline_abbr) {
              console.log(`  Medline Abbr: ${journal.medline_abbr}`);
            }
            if (journal.issns && journal.issns.length > 0) {
              console.log(`  ISSNs: ${journal.issns.join(', ')}`);
            }
          });
        } catch (error) {
          console.error('Error finding journals:', error);
        }
      });
    
    // Get journals for a specialty
    program
      .command('specialty-journals')
      .description('Get journals for a specific specialty')
      .argument('<specialty>', 'Specialty name')
      .action(async (specialty: string) => {
        try {
          const journals = journalDbService.getJournalsBySpecialty(specialty);
          
          if (journals.length === 0) {
            console.log(`No journals found for specialty "${specialty}"`);
            return;
          }
          
          console.log(`Found ${journals.length} journals for specialty "${specialty}":`);
          journals.forEach(journal => {
            console.log(`- ${journal.title} (${journal.nlm_id})`);
            if (journal.medline_abbr) {
              console.log(`  Medline Abbr: ${journal.medline_abbr}`);
            }
            if (journal.issns && journal.issns.length > 0) {
              console.log(`  ISSNs: ${journal.issns.join(', ')}`);
            }
          });
        } catch (error) {
          console.error('Error getting specialty journals:', error);
        }
      });
    
    program.parse();
  } catch (error) {
    console.error('Error initializing journal manager:', error);
    process.exit(1);
  }
}

// Run the CLI
init().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
