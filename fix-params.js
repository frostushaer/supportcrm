const fs = require('fs');
const glob = require('child_process').execSync('find app/api/hrm app/api/workers -name route.ts').toString().trim().split('\n');

for (const file of glob) {
  if (!file) continue;
  let content = fs.readFileSync(file, 'utf8');

  // If we accidentally messed up the type in the previous run:
  content = content.replace(/\{ params \}: \{ params: Promise<\{ : string \}> \}/g, '{ params }: { params: { id: string } }');
  
  // First, revert back to old style
  content = content.replace(/try \{\n    const resolvedParams = await params;/g, 'try {');
  content = content.replace(/resolvedParams\.id/g, 'params.id');
  content = content.replace(/resolvedParams\.leaveId/g, 'params.leaveId');
  content = content.replace(/resolvedParams\.availId/g, 'params.availId');
  content = content.replace(/resolvedParams\.trainingId/g, 'params.trainingId');

  // Now apply the correct replacements
  content = content.replace(/\{ params \}: \{ params: \{ ([a-zA-Z0-9_]+): string \} \}/g, '{ params }: { params: Promise<{ $1: string }> }');
  
  if (content.includes('Promise<{ id: string }>')) {
    content = content.replace(/try \{/g, 'try {\n    const resolvedParams = await params;');
    content = content.replace(/params\.id/g, 'resolvedParams.id');
  } else if (content.includes('Promise<{ leaveId: string }>')) {
    content = content.replace(/try \{/g, 'try {\n    const resolvedParams = await params;');
    content = content.replace(/params\.leaveId/g, 'resolvedParams.leaveId');
  } else if (content.includes('Promise<{ availId: string }>')) {
    content = content.replace(/try \{/g, 'try {\n    const resolvedParams = await params;');
    content = content.replace(/params\.availId/g, 'resolvedParams.availId');
  } else if (content.includes('Promise<{ trainingId: string }>')) {
    content = content.replace(/try \{/g, 'try {\n    const resolvedParams = await params;');
    content = content.replace(/params\.trainingId/g, 'resolvedParams.trainingId');
  }

  fs.writeFileSync(file, content);
}
console.log('Successfully fixed Next.js 15 params types.');
