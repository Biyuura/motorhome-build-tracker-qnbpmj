
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  Animated,
  TouchableWithoutFeedback,
  Dimensions,
  PanResponder,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { colors } from '../styles/commonStyles';

interface SimpleBottomSheetProps {
  children?: React.ReactNode;
  isVisible?: boolean;
  onClose?: () => void;
}

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

export default function SimpleBottomSheet({
  children,
  isVisible = false,
  onClose,
}: SimpleBottomSheetProps) {
  const [visible, setVisible] = useState(isVisible);
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const [currentSnapPoint, setCurrentSnapPoint] = useState(SCREEN_HEIGHT * 0.7);
  const [isDragging, setIsDragging] = useState(false);

  // Dynamic snap points based on content and screen size
  const SNAP_POINTS = [
    SCREEN_HEIGHT * 0.4,  // Small - 40% of screen
    SCREEN_HEIGHT * 0.7,  // Medium - 70% of screen  
    SCREEN_HEIGHT * 0.9,  // Large - 90% of screen
  ];

  const CLOSE_THRESHOLD = SCREEN_HEIGHT * 0.2; // Close if dragged below 20% of screen

  useEffect(() => {
    if (isVisible) {
      setVisible(true);
      const initialSnapPoint = SNAP_POINTS[1]; // Start at medium height (70%)
      setCurrentSnapPoint(initialSnapPoint);
      
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: SCREEN_HEIGHT - initialSnapPoint,
          useNativeDriver: true,
          tension: 80,
          friction: 8,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 0.5,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: SCREEN_HEIGHT,
          useNativeDriver: true,
          tension: 80,
          friction: 8,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setVisible(false);
      });
    }
  }, [isVisible, translateY, backdropOpacity, SNAP_POINTS]);

  const handleBackdropPress = () => {
    if (!isDragging) {
      onClose?.();
    }
  };

  const snapToPoint = (snapHeight: number) => {
    const targetY = SCREEN_HEIGHT - snapHeight;
    setCurrentSnapPoint(snapHeight);
    
    Animated.spring(translateY, {
      toValue: targetY,
      useNativeDriver: true,
      tension: 80,
      friction: 8,
    }).start();
  };

  const getClosestSnapPoint = (currentY: number, velocityY: number) => {
    const currentHeight = SCREEN_HEIGHT - currentY;
    
    // If dragging down fast or below close threshold, close the modal
    if (velocityY > 800 || currentHeight < CLOSE_THRESHOLD) {
      return 0; // Close
    }
    
    // If dragging up fast, go to largest snap point
    if (velocityY < -800) {
      return SNAP_POINTS[SNAP_POINTS.length - 1];
    }
    
    // Find closest snap point
    let closestPoint = SNAP_POINTS[0];
    let minDistance = Math.abs(currentHeight - SNAP_POINTS[0]);
    
    for (const point of SNAP_POINTS) {
      const distance = Math.abs(currentHeight - point);
      if (distance < minDistance) {
        minDistance = distance;
        closestPoint = point;
      }
    }
    
    return closestPoint;
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Only respond to vertical gestures that are significant enough
        const isVerticalGesture = Math.abs(gestureState.dy) > Math.abs(gestureState.dx);
        const isSignificantMovement = Math.abs(gestureState.dy) > 8;
        return isVerticalGesture && isSignificantMovement;
      },
      onPanResponderGrant: () => {
        setIsDragging(true);
        // Stop any ongoing animations
        translateY.stopAnimation();
      },
      onPanResponderMove: (_, gestureState) => {
        const currentY = SCREEN_HEIGHT - currentSnapPoint;
        const newY = currentY + gestureState.dy;
        
        // Allow some overscroll at the top for better UX
        const minY = SCREEN_HEIGHT - SNAP_POINTS[SNAP_POINTS.length - 1] - 50;
        const maxY = SCREEN_HEIGHT + 50; // Allow some overscroll at bottom
        
        const constrainedY = Math.max(minY, Math.min(maxY, newY));
        translateY.setValue(constrainedY);
      },
      onPanResponderRelease: (_, gestureState) => {
        setIsDragging(false);
        const currentY = SCREEN_HEIGHT - currentSnapPoint + gestureState.dy;
        const targetSnapHeight = getClosestSnapPoint(currentY, gestureState.vy);
        
        if (targetSnapHeight === 0) {
          onClose?.();
        } else {
          snapToPoint(targetSnapHeight);
        }
      },
    })
  ).current;

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <TouchableWithoutFeedback onPress={handleBackdropPress}>
          <Animated.View
            style={[
              styles.backdrop,
              {
                opacity: backdropOpacity,
              },
            ]}
          />
        </TouchableWithoutFeedback>
        
        <Animated.View
          style={[
            styles.bottomSheet,
            {
              height: SCREEN_HEIGHT * 0.95, // Allow almost full screen height
              transform: [{ translateY }],
            },
          ]}
        >
          {/* Draggable handle area */}
          <View 
            style={styles.handleContainer}
            {...panResponder.panHandlers}
          >
            <View style={styles.handle} />
          </View>
          
          {/* Scrollable content */}
          <ScrollView 
            style={styles.scrollContent}
            contentContainerStyle={styles.scrollContentContainer}
            showsVerticalScrollIndicator={false}
            bounces={true}
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled={true}
          >
            <View style={styles.content}>
              {children}
            </View>
          </ScrollView>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'black',
  },
  bottomSheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.backgroundAlt,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 15,
  },
  handleContainer: {
    paddingVertical: 16,
    alignItems: 'center',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    backgroundColor: colors.backgroundAlt,
    zIndex: 1,
  },
  handle: {
    width: 50,
    height: 5,
    backgroundColor: colors.grey,
    borderRadius: 3,
    opacity: 0.6,
  },
  scrollContent: {
    flex: 1,
  },
  scrollContentContainer: {
    flexGrow: 1,
  },
  content: {
    paddingBottom: 60, // Extra padding at bottom to ensure buttons are reachable
    minHeight: 400, // Minimum height to ensure content is accessible
  },
});
