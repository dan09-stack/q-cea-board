// Mock data for testing queue display UI

export interface FacultyItem {
  id: string;
  name: string;
  displayedTicket: string;
  userType: string;
  numOnQueue: number;
  currentStudentProgram?: string;
}

// Mock data for faculty
export const mockFacultyData: FacultyItem[] = [
  {
    id: '1',
    name: 'Dr. Smith',
    displayedTicket: '0023',
    userType: 'FACULTY',
    numOnQueue: 5,
    currentStudentProgram: 'BSCS'
  },
  {
    id: '1',
    name: 'Dr. Smith',
    displayedTicket: '0023',
    userType: 'FACULTY',
    numOnQueue: 5,
    currentStudentProgram: 'BSCS'
  },
  {
    id: '1',
    name: 'Dr. Smith',
    displayedTicket: '0023',
    userType: 'FACULTY',
    numOnQueue: 5,
    currentStudentProgram: 'BSCS'
  },
  {
    id: '1',
    name: 'Dr. Smith',
    displayedTicket: '0023',
    userType: 'FACULTY',
    numOnQueue: 5,
    currentStudentProgram: 'BSCS'
  },
  {
    id: '1',
    name: 'Dr. Smith',
    displayedTicket: '0023',
    userType: 'FACULTY',
    numOnQueue: 5,
    currentStudentProgram: 'BSCS'
  },
  {
    id: '2',
    name: 'Prof. Johnson',
    displayedTicket: '0045',
    userType: 'FACULTY',
    numOnQueue: 3,
    currentStudentProgram: 'BSIT'
  },
  {
    id: '3',
    name: 'Dr. Williams',
    displayedTicket: '0067',
    userType: 'FACULTY',
    numOnQueue: 7,
    currentStudentProgram: 'BSECE'
  },
  {
    id: '3',
    name: 'Dr. Williams',
    displayedTicket: '0067',
    userType: 'FACULTY',
    numOnQueue: 7,
    currentStudentProgram: 'BSECE'
  },
  {
    id: '3',
    name: 'Dr. Williams',
    displayedTicket: '0067',
    userType: 'FACULTY',
    numOnQueue: 7,
    currentStudentProgram: 'BSECE'
  }
];

// Mock data for waiting students
export const mockAllDocs = [
  // Students for Dr. Smith
  {
    id: 's1',
    data: () => ({ 
      faculty: 'Dr. Smith', 
      userType: 'STUDENT', 
      userTicketNumber: '0024',
      program: 'BSCS'
    })
  },
  {
    id: 's2',
    data: () => ({ 
      faculty: 'Dr. Smith', 
      userType: 'STUDENT', 
      userTicketNumber: '0025',
      program: 'BSCS'
    })
  },
  {
    id: 's3',
    data: () => ({ 
      faculty: 'Dr. Smith', 
      userType: 'STUDENT', 
      userTicketNumber: '0026',
      program: 'BSIT'
    })
  },
  {
    id: 's4',
    data: () => ({ 
      faculty: 'Dr. Smith', 
      userType: 'STUDENT', 
      userTicketNumber: '0027',
      program: 'BSCS'
    })
  },
  
  // Students for Prof. Johnson
  {
    id: 's5',
    data: () => ({ 
      faculty: 'Prof. Johnson', 
      userType: 'STUDENT', 
      userTicketNumber: '0046',
      program: 'BSIT'
    })
  },
  {
    id: 's6',
    data: () => ({ 
      faculty: 'Prof. Johnson', 
      userType: 'STUDENT', 
      userTicketNumber: '0047',
      program: 'BSIT'
    })
  },
  
  // Students for Dr. Williams
  {
    id: 's7',
    data: () => ({ 
      faculty: 'Dr. Williams', 
      userType: 'STUDENT', 
      userTicketNumber: '0068',
      program: 'BSECE'
    })
  },
  {
    id: 's8',
    data: () => ({ 
      faculty: 'Dr. Williams', 
      userType: 'STUDENT', 
      userTicketNumber: '0069',
      program: 'BSECE'
    })
  },
  {
    id: 's9',
    data: () => ({ 
      faculty: 'Dr. Williams', 
      userType: 'STUDENT', 
      userTicketNumber: '0070',
      program: 'BSECE'
    })
  },
  {
    id: 's10',
    data: () => ({ 
      faculty: 'Dr. Williams', 
      userType: 'STUDENT', 
      userTicketNumber: '0071',
      program: 'BSECE'
    })
  },
];
