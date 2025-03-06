import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, Image } from 'react-native';
import { collection, onSnapshot, QueryDocumentSnapshot } from 'firebase/firestore';
import { db } from '@/firebaseConfig';

// Move constants outside the component
const ROW_HEIGHT = 80; // Approximate height of each row
const ROWS_PER_PAGE = 6; // Number of rows to show at once
const PAUSE_DURATION = 5000; // Pause duration in milliseconds (5 seconds)

// Define FacultyItem interface since we're not importing from mockData
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
  const servingScrollViewRef = useRef<ScrollView>(null);
  const waitingScrollViewRef = useRef<ScrollView>(null);
  const [contentHeight, setContentHeight] = useState(0);
  const screenHeight = Dimensions.get('window').height;

  useEffect(() => {
    // Use real Firebase data
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

  // Synchronized scrolling function
  const handleScroll = (event: any, targetRef: React.RefObject<ScrollView>) => {
    const y = event.nativeEvent.contentOffset.y;
    if (targetRef.current) {
      targetRef.current.scrollTo({ y, animated: false });
    }
  };

  // Auto-scroll effect for the content
  useEffect(() => {
    if (contentHeight > screenHeight * 0.6) {
      // Calculate approx page size (height of 6 rows)
      const pageSize = ROWS_PER_PAGE * ROW_HEIGHT;
      
      // Set up auto-scrolling for both sections simultaneously
      let currentPage = 0;
      let scrollPosition = 0;
      let isPaused = false;
      let maxPages = Math.ceil(contentHeight / pageSize);
      
      const scrollInterval = setInterval(() => {
        if (servingScrollViewRef.current && waitingScrollViewRef.current && !isPaused) {
          // Calculate the new scroll position for the current page
          scrollPosition = currentPage * pageSize;
          
          // Perform the scroll on both sections
          servingScrollViewRef.current.scrollTo({ y: scrollPosition, animated: true });
          waitingScrollViewRef.current.scrollTo({ y: scrollPosition, animated: true });
          
          // Set the pause flag
          isPaused = true;
          
          // Schedule unpause after PAUSE_DURATION
          setTimeout(() => {
            isPaused = false;
            
            // Move to next page
            currentPage++;
            
            // If reached the end, go back to first page
            if (currentPage >= maxPages) {
              currentPage = 0;
            }
          }, PAUSE_DURATION);
        }
      }, PAUSE_DURATION + 500); // Add a small buffer to the interval
      
      return () => {
        clearInterval(scrollInterval);
      };
    }
  }, [contentHeight, screenHeight, facultyData]);

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
            {/* Fixed header */}
            <View style={styles.stickyHeader}>
              <Text style={styles.mainHeading}>NOW SERVING</Text>
            </View>
            
            {/* Scrollable content */}
            <ScrollView 
              ref={servingScrollViewRef}
              style={styles.sectionScrollView}
              contentContainerStyle={styles.scrollViewContent}
              onContentSizeChange={(width, height) => {
                setContentHeight(height);
              }}
              showsVerticalScrollIndicator={false}
              onScroll={(e) => handleScroll(e, waitingScrollViewRef)}
              scrollEventThrottle={16}
            >
              <View style={styles.servingContent}>
                {facultyData.map((faculty) => (
                  <View key={faculty.id} style={styles.ticketRow}>
                    {faculty.displayedTicket && (
                      <>
                        <Text style={styles.faculty}>{faculty.name}</Text>
                        <Text style={styles.ticket}>
                          {faculty.currentStudentProgram && `${faculty.currentStudentProgram}-`}
                          {String(faculty.displayedTicket).padStart(4, '0')}
                        </Text>
                      </>
                    )}
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>

          <View style={styles.verticalSeparator} />

          {/* RIGHT SECTION - WAITING */}
          <View style={styles.mainSection}>
            {/* Fixed header */}
            <View style={styles.stickyHeader}>
              <Text style={styles.mainHeading}>WAITING</Text>
            </View>
            
            {/* Scrollable content */}
            <ScrollView 
              ref={waitingScrollViewRef}
              style={styles.sectionScrollView}
              contentContainerStyle={styles.scrollViewContent}
              showsVerticalScrollIndicator={false}
              onScroll={(e) => handleScroll(e, servingScrollViewRef)}
              scrollEventThrottle={16}
            >
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
                      {faculty.displayedTicket && (
                        <>
                          <ScrollView 
                            horizontal={true}
                            showsHorizontalScrollIndicator={false}
                            style={styles.waitingScrollView}
                            contentContainerStyle={styles.waitingContainer}>
                            {waitingStudents.length > 0 ? (
                              <>
                                {waitingStudents.slice(0, 3).map((student, index) => (
                                  <Text key={student.id} style={styles.waiting}>
                                    {student.data().program}-
                                    {String(student.data().userTicketNumber).padStart(4, '0')}
                                    {index < Math.min(waitingStudents.length, 3) - 1 && index < 2 ? ", " : ""}
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
                        </>
                      )}
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
    flex: 0.6,
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
    backgroundColor: '#A31D1D',
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
    opacity: 0.1, // Adjust opacity as needed
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
    gap: 10,
    flex: 1,
    height: ROW_HEIGHT,
  },
  faculty: {
    fontSize: 36,
    fontWeight: 'bold',
    flex:1.5,
  },
  ticket: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#D84040',
    textAlign: 'right',
    flex: 0.6,
  },
  waitingRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    alignItems: 'center',
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
