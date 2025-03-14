import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import { collection, onSnapshot, QueryDocumentSnapshot } from 'firebase/firestore';
import { db } from '@/firebaseConfig';

// Define FacultyItem interface
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
  
  // References for ScrollViews
  const servingScrollViewRef = useRef<ScrollView>(null);
  const waitingScrollViewRef = useRef<ScrollView>(null);
  
  // Current index for scrolling
  const [currentIndex, setCurrentIndex] = useState(0);
  const [ticketHeight, setTicketHeight] = useState(100); // Default height

  useEffect(() => {
    const facultyCollectionRef = collection(db, 'student');
    const unsubscribe = onSnapshot(facultyCollectionRef, (snapshot) => {
      const docs = snapshot.docs;
      setAllDocs(docs);

      const facultyDocs = docs
        .filter(doc => doc.data().userType === 'FACULTY')
        .sort((a, b) => (a.data().fullName || '').localeCompare(b.data().fullName || ''));

      const faculty = facultyDocs.map(facultyDoc => {
        const displayedTicket = facultyDoc.data().displayedTicket;
        const matchingStudent = docs.find(
          doc => doc.data().userTicketNumber === displayedTicket && doc.data().userType !== 'FACULTY'
        );

        return {
          id: facultyDoc.id,
          name: facultyDoc.data().fullName || '',
          displayedTicket: displayedTicket || '',
          userType: facultyDoc.data().userType || '',
          numOnQueue: facultyDoc.data().numOnQueue || 0,
          currentStudentProgram: matchingStudent?.data().program || ''
        };
      });

      setFacultyData(faculty);
    });

    return () => unsubscribe();
  }, []);

  // Set up auto-scrolling
  useEffect(() => {
    // Only start auto-scrolling if we have content
    const activeFaculty = facultyData.filter(faculty => faculty.displayedTicket);
    if (activeFaculty.length === 0) return;
    
    // Function to scroll to the next faculty
    const scrollToNext = () => {
      // Calculate next index, wrapping around to 0 if we reach the end
      const nextIndex = (currentIndex + 1) % activeFaculty.length;
      
      // Calculate the Y position based on index and ticket height
      // Adding a small offset for margins/padding
      const yPosition = nextIndex * (ticketHeight + 25); 
      
      // Scroll both views to the same relative position
      servingScrollViewRef.current?.scrollTo({ y: yPosition, animated: true });
      waitingScrollViewRef.current?.scrollTo({ y: yPosition, animated: true });
      
      // Update the current index
      setCurrentIndex(nextIndex);
    };
    
    // Set a timer to scroll after a 2-second pause
    const timer = setTimeout(scrollToNext, 5000);
    
    // Clean up timer when component unmounts or when dependencies change
    return () => clearTimeout(timer);
  }, [currentIndex, facultyData, ticketHeight]);

  // Measure the height of a ticket row to use for scrolling calculations
  const onTicketLayout = (event: any) => {
    const { height } = event.nativeEvent.layout;
    if (height > 0 && height !== ticketHeight) {
      setTicketHeight(height);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {/* Background Logo */}
        <View style={styles.backgroundLogoContainer}>
          <Image 
            source={require('../assets/images/final.png')} 
            style={styles.backgroundLogo} 
            resizeMode="contain"
          />
        </View>
        
        <View style={styles.mainRow}>
          {/* LEFT SECTION - NOW SERVING */}
          <View style={styles.mainSection}>
            <View style={styles.stickyHeader}>
              <Text style={styles.mainHeading}>NOW SERVING</Text>
            </View>
            
            <ScrollView 
              ref={servingScrollViewRef}
              style={styles.sectionScrollView}
              contentContainerStyle={styles.scrollViewContent}
              showsVerticalScrollIndicator={false}
              scrollEnabled={false} // Disable manual scrolling
            >
              <View style={styles.servingContent}>
                {facultyData
                  .filter(faculty => faculty.displayedTicket)
                  .map((faculty, index) => (
                    <View 
                      key={faculty.id} 
                      style={styles.ticketRow}
                      onLayout={index === 0 ? onTicketLayout : undefined}
                    >
                      <Text style={styles.faculty}>{faculty.name}</Text>
                      <Text style={styles.ticket}>
                        {faculty.currentStudentProgram && `${faculty.currentStudentProgram}-`}
                        {String(faculty.displayedTicket).padStart(4, '0')}
                      </Text>
                    </View>
                  ))}
              </View>
            </ScrollView>
          </View>

          <View style={styles.verticalSeparator} />

          {/* RIGHT SECTION - WAITING */}
          <View style={styles.mainSection}>
            <View style={styles.stickyHeader}>
              <Text style={styles.mainHeading}>WAITING</Text>
            </View>
            
            <ScrollView 
              ref={waitingScrollViewRef}
              style={styles.sectionScrollView}
              contentContainerStyle={styles.scrollViewContent}
              showsVerticalScrollIndicator={false}
              scrollEnabled={false} // Disable manual scrolling
            >
              <View style={styles.waitingContent}>
                {facultyData
                  .filter(faculty => faculty.displayedTicket)
                  .map((faculty) => {
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
                      });

                    return (
                      <View key={faculty.id} style={styles.ticketRow}>
                        <ScrollView 
                          horizontal={true}
                          showsHorizontalScrollIndicator={false}
                          style={styles.waitingScrollView}
                          contentContainerStyle={styles.waitingContainer}
                          scrollEnabled={false} // Disable manual scrolling
                        >
                          {waitingStudents.length > 0 ? (
                            <>
                              {waitingStudents.slice(0, 3).map((student, index) => (
                                <Text key={student.id} style={styles.waiting}>
                                  {student.data().program}-
                                  {String(student.data().userTicketNumber).padStart(4, '0')}
                                  {index < Math.min(waitingStudents.length, 3) - 1 ? ", " : ""}
                                </Text>
                              ))}
                              {waitingStudents.length > 3 && (
                                <Text style={styles.waiting}>...</Text>
                              )}
                            </>
                          ) : (
                            <Text style={styles.waiting}>NONE</Text>
                          )}
                        </ScrollView>
                      </View>
                    );
                  })}
              </View>
            </ScrollView>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  stickyHeader: {
    paddingVertical: 10,
    marginBottom: 15,
    zIndex: 2,
  },
  sectionScrollView: {
    flex: 1,
    width: '100%',
  },
  scrollViewContent: {
    paddingBottom: 20,
  },
  waitingScrollView: {
    flex: 1,
  },
  waitingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingRight: 20,
  },
  program: {
    fontSize: 32,
    color: '#4a5568',
    marginLeft: 20,
  },
  container: {
    flex: 1,
    backgroundColor: 'rgb(46, 1, 1)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  card: {
    backgroundColor: '#e6e6e6',
    width: '100%',
    height: '100%',
    padding: 30,
    borderRadius: 10,
    position: 'relative',
  },
  backgroundLogoContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 0,
  },
  backgroundLogo: {
    width: "75%",
    height: "75%",
    opacity: 0.1,
  },
  mainRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flex: 1,
    zIndex: 1,
  },
  mainSection: {
    flex: 1,
    padding: 15,
    display: 'flex',
    flexDirection: 'column',
  },
  mainHeading: {
    fontSize: 48,
    fontWeight: 'bold',
    textAlign: 'center',
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
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    gap: 20,
    marginBottom: 20,
    flex: 1,
    height: 100,
  },
  faculty: {
    fontSize: 36,
    fontWeight: 'bold',
    flex: 1.5,
  },
  ticket: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#D84040',
    textAlign: 'right',
    flex: 0.6,
  },
  waiting: {
    fontSize: 40,
  },
  verticalSeparator: {
    width: 3,
    backgroundColor: 'rgb(84, 3, 3)',
    marginHorizontal: 20,
  },
});

export default QueueDisplay;
