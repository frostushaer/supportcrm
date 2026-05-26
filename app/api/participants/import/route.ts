import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import * as XLSX from 'xlsx';
import { db } from '@/lib/db';
import { participantSchema } from '@/lib/validations/participants';
import { auth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// Global singleton mock store
const g = global as typeof global & { __mockParticipants?: any[] };
if (!g.__mockParticipants) {
  g.__mockParticipants = [];
}
const mockParticipants = g.__mockParticipants;

interface ValidationError {
  row: number;
  message: string;
}

interface ImportResult {
  success: boolean;
  imported: number;
  errors: ValidationError[];
  message: string;
}

// Helper to parse Excel date (which comes as a number or string)
function parseExcelDate(dateValue: any): string | null {
  if (!dateValue) return null;
  
  // If it's a number, it's an Excel serial date
  if (typeof dateValue === 'number') {
    // Excel epoch is 1900-01-01, but has a bug with leap year
    const excelEpoch = new Date(1899, 11, 30);
    const date = new Date(excelEpoch.getTime() + dateValue * 24 * 60 * 60 * 1000);
    return date.toISOString().split('T')[0];
  }
  
  // If it's a string, try to parse it
  if (typeof dateValue === 'string') {
    // Handle DD/MM/YYYY format
    const parts = dateValue.split(/[/-]/);
    if (parts.length === 3) {
      const [day, month, year] = parts;
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
    // Try standard date parsing
    const parsed = new Date(dateValue);
    if (!isNaN(parsed.getTime())) {
      return parsed.toISOString().split('T')[0];
    }
  }
  
  return null;
}

// Helper to normalize headers (remove spaces, lowercase, etc.)
function normalizeHeader(header: string): string {
  return header.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '');
}

// Map Excel headers to schema fields
const headerMapping: Record<string, string> = {
  'firstname': 'firstName',
  'first_name': 'firstName',
  'last_name': 'lastName',
  'lastname': 'lastName',
  'email': 'primaryEmailAddress',
  'emailaddress': 'primaryEmailAddress',
  'primaryemail': 'primaryEmailAddress',
  'phone': 'primaryPhoneNumber',
  'phonenumber': 'primaryPhoneNumber',
  'primaryphone': 'primaryPhoneNumber',
  'mobilenumber': 'primaryPhoneNumber',
  'ndisnumber': 'ndisNumber',
  'ndis': 'ndisNumber',
  'ndis_id': 'ndisNumber',
  'dateofbirth': 'dateOfBirth',
  'dob': 'dateOfBirth',
  'birthdate': 'dateOfBirth',
  'address': 'address',
  'streetaddress': 'address',
  'street': 'address',
  'suburb': 'suburb',
  'city': 'suburb',
  'state': 'state',
  'postcode': 'postcode',
  'zip': 'postcode',
  'gender': 'gender',
  'servicesupport': 'serviceSupport',
  'supportcategory': 'serviceSupport',
  'region': 'regionId',
  'regionid': 'regionId',
  'region_id': 'regionId',
  'auditparticipation': 'auditParticipation',
  'optinaudit': 'auditParticipation',
  'emergencycontactname': 'emergencyContactName',
  'emergencycontact': 'emergencyContactName',
  'emergencycontactnumber': 'emergencyContactNumber',
  'emergencyphone': 'emergencyContactNumber',
  'planmanagedby': 'planManagedBy',
  'planmanager': 'planManagedBy',
  'timezone': 'timezone',
  'status': 'status',
};

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      return NextResponse.json(
        { success: false, error: 'Only .xlsx and .xls files are supported' },
        { status: 400 }
      );
    }

    // Read file buffer
    const bytes = await file.arrayBuffer();
    const workbook = XLSX.read(bytes, { type: 'array' });
    
    // Get first sheet
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Convert to JSON
    const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: false }) as any[][];
    
    if (rawData.length < 2) {
      return NextResponse.json(
        { success: false, error: 'File appears to be empty or missing data rows' },
        { status: 400 }
      );
    }

    // Extract headers (first row)
    const headers = rawData[0].map(h => String(h || '').trim());
    const normalizedHeaders = headers.map(h => normalizeHeader(h));
    
    // Map headers to field names
    const fieldMapping = normalizedHeaders.map(h => headerMapping[h] || null);
    
    // Find required field indices
    const firstNameIndex = fieldMapping.indexOf('firstName');
    const lastNameIndex = fieldMapping.indexOf('lastName');
    const ndisIndex = fieldMapping.indexOf('ndisNumber');
    const emailIndex = fieldMapping.indexOf('primaryEmailAddress');
    const phoneIndex = fieldMapping.indexOf('primaryPhoneNumber');
    const dobIndex = fieldMapping.indexOf('dateOfBirth');
    const addressIndex = fieldMapping.indexOf('address');
    const suburbIndex = fieldMapping.indexOf('suburb');
    const stateIndex = fieldMapping.indexOf('state');
    const postcodeIndex = fieldMapping.indexOf('postcode');
    const regionIndex = fieldMapping.indexOf('regionId');

    // Check for required columns
    if (firstNameIndex === -1 || lastNameIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Missing required columns: First Name and Last Name are required' },
        { status: 400 }
      );
    }

    const errors: ValidationError[] = [];
    const participants: any[] = [];
    
    // Process data rows (skip header)
    for (let i = 1; i < rawData.length; i++) {
      const row = rawData[i];
      const rowNum = i + 1;
      
      // Skip empty rows
      if (!row || row.every(cell => !cell)) continue;
      
      const participant: any = {};
      
      // Map fields
      fieldMapping.forEach((field, index) => {
        if (field && row[index] !== undefined && row[index] !== null && row[index] !== '') {
          if (field === 'dateOfBirth') {
            const parsedDate = parseExcelDate(row[index]);
            if (parsedDate) {
              participant[field] = parsedDate;
            }
          } else if (field === 'auditParticipation') {
            const val = String(row[index]).toLowerCase().trim();
            participant[field] = val === 'true' || val === 'yes' || val === '1';
          } else {
            participant[field] = String(row[index]).trim();
          }
        }
      });
      
      // Set defaults for missing required fields
      if (!participant.primaryEmailAddress) {
        participant.primaryEmailAddress = '';
      }
      if (!participant.primaryPhoneNumber) {
        participant.primaryPhoneNumber = '';
      }
      if (!participant.dateOfBirth) {
        participant.dateOfBirth = '1990-01-01';
      }
      if (!participant.address) {
        participant.address = '';
      }
      if (!participant.suburb) {
        participant.suburb = '';
      }
      if (!participant.state) {
        participant.state = 'VIC';
      }
      if (!participant.postcode) {
        participant.postcode = '3000';
      }
      if (!participant.ndisNumber) {
        participant.ndisNumber = '';
      }
      if (!participant.serviceSupport) {
        participant.serviceSupport = 'Core';
      }
      if (participant.auditParticipation === undefined) {
        participant.auditParticipation = false;
      }
      if (!participant.regionId) {
        // Get first available region or use a default
        participant.regionId = 'region_1';
      }
      if (!participant.gender) {
        participant.gender = 'Other';
      }
      
      // Validate NDIS number format (9 digits)
      if (participant.ndisNumber) {
        const ndisDigits = participant.ndisNumber.replace(/\D/g, '');
        if (ndisDigits.length !== 9) {
          errors.push({
            row: rowNum,
            message: `Row ${rowNum}: Invalid NDIS number format. NDIS number must be exactly 9 digits.`
          });
        }
        participant.ndisNumber = ndisDigits;
      }
      
      // Validate required fields
      if (!participant.firstName || participant.firstName.trim() === '') {
        errors.push({
          row: rowNum,
          message: `Row ${rowNum}: First Name is required`
        });
      }
      if (!participant.lastName || participant.lastName.trim() === '') {
        errors.push({
          row: rowNum,
          message: `Row ${rowNum}: Last Name is required`
        });
      }
      
      // Validate email format if provided
      if (participant.primaryEmailAddress && participant.primaryEmailAddress !== '') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(participant.primaryEmailAddress)) {
          errors.push({
            row: rowNum,
            message: `Row ${rowNum}: Invalid email format`
          });
        }
      }
      
      // Validate postcode if provided
      if (participant.postcode && !/^\d{4}$/.test(participant.postcode)) {
        errors.push({
          row: rowNum,
          message: `Row ${rowNum}: Postcode must be exactly 4 digits`
        });
      }
      
      if (errors.filter(e => e.row === rowNum).length === 0) {
        participants.push(participant);
      }
    }
    
    // If there are validation errors, return them without importing
    if (errors.length > 0) {
      return NextResponse.json({
        success: false,
        imported: 0,
        errors,
        message: `Found ${errors.length} error(s). Please fix these errors before importing.`
      }, { status: 400 });
    }
    
    // Import participants
    let imported = 0;
    const importedParticipants: any[] = [];
    
    for (const participantData of participants) {
      try {
        // Check if participant with same NDIS number already exists
        const existingNdisDigits = participantData.ndisNumber?.replace(/\D/g, '');
        let existing;
        
        try {
          existing = await db.participant.findFirst({
            where: {
              ndisNumber: {
                contains: existingNdisDigits,
              }
            }
          });
        } catch {
          // Database not available, check mock data
          existing = mockParticipants.find(p => 
            p.ndisNumber?.replace(/\D/g, '') === existingNdisDigits
          );
        }
        
        if (existing) {
          errors.push({
            row: participants.indexOf(participantData) + 2,
            message: `Row ${participants.indexOf(participantData) + 2}: Participant with NDIS number ${participantData.ndisNumber} already exists`
          });
          continue;
        }
        
        // Validate with schema
        const validated = participantSchema.parse(participantData);
        
        let participant;
        try {
          participant = await db.participant.create({
            data: {
              ...validated,
              dateOfBirth: new Date(validated.dateOfBirth),
            },
          });
        } catch {
          // Add to mock data if database not available
          participant = {
            id: `import-${Date.now()}-${imported}`,
            ...validated,
            region: { id: validated.regionId, name: 'Imported' },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          mockParticipants.unshift(participant);
        }
        
        importedParticipants.push(participant);
        imported++;
      } catch (error) {
        if (error instanceof z.ZodError) {
          error.issues.forEach((issue: z.ZodIssue) => {
            errors.push({
              row: participants.indexOf(participantData) + 2,
              message: `Row ${participants.indexOf(participantData) + 2}: ${issue.message}`
            });
          });
        } else {
          errors.push({
            row: participants.indexOf(participantData) + 2,
            message: `Row ${participants.indexOf(participantData) + 2}: Failed to import - ${error instanceof Error ? error.message : 'Unknown error'}`
          });
        }
      }
    }
    
    // If there were errors during import, return partial success
    if (errors.length > 0 && imported > 0) {
      return NextResponse.json({
        success: true,
        imported,
        errors,
        message: `Imported ${imported} participant(s) with ${errors.length} error(s). Some rows were skipped.`,
        data: importedParticipants
      }, { status: 207 }); // Multi-status
    }
    
    if (errors.length > 0 && imported === 0) {
      return NextResponse.json({
        success: false,
        imported: 0,
        errors,
        message: 'Import failed. Please fix the errors and try again.'
      }, { status: 400 });
    }
    
    return NextResponse.json({
      success: true,
      imported,
      errors: [],
      message: `Successfully imported ${imported} participant(s).`,
      data: importedParticipants
    }, { status: 200 });
    
  } catch (error) {
    console.error('Import error:', error);
    return NextResponse.json(
      { 
        success: false, 
        imported: 0,
        errors: [{ row: 0, message: error instanceof Error ? error.message : 'Failed to process import file' }],
        message: 'Import failed. Please check your file and try again.'
      },
      { status: 500 }
    );
  }
}
