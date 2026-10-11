import fs from 'fs';

const supabaseBatches = JSON.parse(fs.readFileSync('supabase-export/batches.json', 'utf8'));
const cfOutput = fs.readFileSync('cloudflare-students.json', 'utf8');
const cloudflareData = JSON.parse(cfOutput);
const cloudflareStudents = cloudflareData[0].results;

console.log(`Loaded ${cloudflareStudents.length} Cloudflare students`);
console.log(`Loaded ${supabaseBatches.length} Supabase batches`);

// Build Cloudflare student -> batch mapping
const cfStudentBatch = {};
cloudflareStudents.forEach(s => {
  if (s.batch) {
    cfStudentBatch[s.id] = s.batch;
  }
});

console.log('=== BATCH ASSIGNMENT COMPARISON ===\n');

let totalMismatches = 0;
let totalMissingInCF = 0;
let totalExtraInCF = 0;

supabaseBatches.forEach(batch => {
  const supabaseStudentIds = batch.student_ids || [];
  const batchName = batch.name;
  const batchId = batch.id;
  
  // Find Cloudflare students assigned to this batch
  const cfStudentsInBatch = cloudflareStudents
    .filter(s => s.batch === batchId)
    .map(s => s.id);
  
  // Students in Supabase but not in Cloudflare batch
  const missingInCF = supabaseStudentIds.filter(id => !cfStudentsInBatch.includes(id));
  // Students in Cloudflare but not in Supabase
  const extraInCF = cfStudentsInBatch.filter(id => !supabaseStudentIds.includes(id));
  
  if (missingInCF.length > 0 || extraInCF.length > 0) {
    console.log(`\n${batchName} (${batchId})`);
    console.log(`  Supabase student_ids: ${supabaseStudentIds.length}`);
    console.log(`  Cloudflare students:  ${cfStudentsInBatch.length}`);
    
    if (missingInCF.length > 0) {
      console.log(`  ❌ MISSING in CF (${missingInCF.length}):`);
      missingInCF.forEach(id => {
        const student = cloudflareStudents.find(s => s.id === id);
        console.log(`     - ${id} (${student?.full_name || 'NOT IN CF'}) batch=${student?.batch || 'NULL'}`);
        totalMissingInCF++;
      });
    }
    if (extraInCF.length > 0) {
      console.log(`  ⚠️  EXTRA in CF (${extraInCF.length}):`);
      extraInCF.forEach(id => {
        const student = cloudflareStudents.find(s => s.id === id);
        console.log(`     - ${id} (${student?.full_name})`);
        totalExtraInCF++;
      });
    }
    totalMismatches++;
  }
});

// Students in Cloudflare with batch but not in any Supabase batch
const allSupabaseStudentIds = supabaseBatches.flatMap(b => b.student_ids || []);
const cfStudentsWithBatch = cloudflareStudents.filter(s => s.batch).map(s => s.id);
const orphanedInCF = cfStudentsWithBatch.filter(id => !allSupabaseStudentIds.includes(id));

if (orphanedInCF.length > 0) {
  console.log(`\n\n=== ORPHANED IN CLOUDFLARE (${orphanedInCF.length}) ===`);
  orphanedInCF.forEach(id => {
    const student = cloudflareStudents.find(s => s.id === id);
    console.log(`  - ${id} (${student?.full_name}) batch=${student?.batch}`);
  });
}

console.log(`\n=== SUMMARY ===`);
console.log(`Batches with mismatches: ${totalMismatches}`);
console.log(`Students missing in CF: ${totalMissingInCF}`);
console.log(`Extra students in CF: ${totalExtraInCF}`);
console.log(`Orphaned in CF: ${orphanedInCF.length}`);