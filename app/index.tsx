import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { collection, onSnapshot, QueryDocumentSnapshot } from 'firebase/firestore';
import { db } from '@/firebaseConfig';

interface FacultyItem {
  id: string;
  name: string;
  displayedTicket: string;
  userType: string;
  numOnQueue: number;
  currentStudentProgram?: string;
}

const QueueDisplay = () => {
  const [facultyData, setFacultyData] = useState<FacultyItem[]>([]);
  const [allDocs, setAllDocs] = useState<QueryDocumentSnapshot[]>([]);
  useEffect(() => {
    const facultyCollectionRef = collection(db, 'student');
    const unsubscribe = onSnapshot(facultyCollectionRef, (snapshot) => {
      const faculty: FacultyItem[] = [];
      setAllDocs(snapshot.docs);
      const allDocs = snapshot.docs;
      const facultyDocs = allDocs
        .filter(doc => doc.data().userType === 'FACULTY')
        .sort((a, b) => (a.data().fullName || '').localeCompare(b.data().fullName || ''));

      facultyDocs.forEach(facultyDoc => {
        const displayedTicket = facultyDoc.data().displayedTicket;
        const matchingStudent = allDocs.find(
          doc => doc.data().userTicketNumber === displayedTicket && doc.data().userType !== 'FACULTY'
        );

        faculty.push({
          id: facultyDoc.id,
          name: facultyDoc.data().fullName || '',
          displayedTicket: displayedTicket || '',
          userType: facultyDoc.data().userType || '',
          numOnQueue: facultyDoc.data().numOnQueue || 0,
          currentStudentProgram: matchingStudent?.data().program || ''
        });
      });
      
      setFacultyData(faculty);
    });

    return () => unsubscribe();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.mainRow}>
          <View style={styles.mainSection}>
            <Text style={styles.mainHeading}>NOW SERVING</Text>
            <View style={styles.servingContent}>
              {facultyData.map((faculty) => (
                <View key={faculty.id} style={styles.ticketRow}>
                <Text style={styles.faculty}>{faculty.name}</Text>
                <Text style={styles.ticket}>
                  {faculty.currentStudentProgram && `${faculty.currentStudentProgram}-`}
                  {String(faculty.displayedTicket).padStart(4, '0')}
                </Text>
              </View>
              ))}
            </View>
          </View>

          <View style={styles.verticalSeparator} />

          <View style={styles.mainSection}>
            <Text style={styles.mainHeading}>WAITING</Text>
            <View style={styles.waitingContent}>
              {facultyData.map((faculty) => {
                const waitingStudents = allDocs
                .filter(doc =>
                  doc.data().faculty === faculty.name &&
                  doc.data().userType !== 'FACULTY' &&
                  parseInt(doc.data().userTicketNumber) > parseInt(faculty.displayedTicket)
                )
                .sort((a, b) => {
                  const ticketA = parseInt(a.data().userTicketNumber) || 0;
                  const ticketB = parseInt(b.data().userTicketNumber) || 0;
                  return ticketA - ticketB;
                })
              
                return (
                  <View key={faculty.id} style={styles.ticketRow}>
                    <Text style={styles.faculty}>{faculty.name}</Text>
                    <View style={styles.waitingContainer}>
                      {waitingStudents.map((student, index) => (
                        <Text key={student.id} style={styles.waiting}>
                          {student.data().program}-{String(student.data().userTicketNumber).padStart(4, '0')}
                          {index < waitingStudents.length - 1 ? ", " : ""}
                        </Text>
                      ))}
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  program: {
    fontSize: 32,
    color: '#4a5568',
    marginLeft: 20,
  },
  container: {
    flex: 1,
    backgroundColor: '#3d5a3a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#e6e6e6',
    width: '98%',
    height: '98%',
    padding: 30,
    borderRadius: 10,
  },
  mainRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  mainSection: {
    flex: 1,
    padding: 15,
  },
  mainHeading: {
    fontSize: 48,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
  },
  servingContent: {
    gap: 25,
  },
  waitingContent: {
    gap: 25,
  },
  ticketRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 30,
  },
  faculty: {
    fontSize: 36,
    fontWeight: 'bold',
    minWidth: 160,
  },
  ticket: {
    fontSize: 40,
    fontWeight: 'bold',
  },
  waitingRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    alignItems: 'center',
  },
  waitingContainer: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
    alignItems: 'center',
    gap: 10,
  },
  waiting: {
    fontSize: 40,
  },
  verticalSeparator: {
    width: 3,
    backgroundColor: '#ccc',
    marginHorizontal: 20,
  },
});

export default QueueDisplay;
