
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
  const [currentSnapPoint, setCurrentSnapPoint] = useState(SCREEN_HEIGHT * 0.5);

  // Dynamic snap points based on content
  const SNAP_POINTS = [
    SCREEN_HEIGHT * 0.3,  // Small
    SCREEN_HEIGHT * 0.6,  // Medium
    SCREEN_HEIGHT * 0.85, // Large
  ];

  useEffect(() => {
    if (isVisible) {
      setVisible(true);
      const initialSnapPoint = SNAP_POINTS[1]; // Start at medium height
      setCurrentSnapPoint(initialSnapPoint);
      
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: SCREEN_HEIGHT - initialSnapPoint,
          useNativeDriver: true,
          tension: 100,
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
          tension: 100,
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
  }, [isVisible, translateY, backdropOpacity]);

  const handleBackdropPress = () => {
    onClose?.();
  };

  const snapToPoint = (snapHeight: number) => {
    const targetY = SCREEN_HEIGHT - snapHeight;
    setCurrentSnapPoint(snapHeight);
    
    Animated.spring(translateY, {
      toValue: targetY,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();
  };

  const getClosestSnapPoint = (currentY: number, velocityY: number) => {
    const currentHeight = SCREEN_HEIGHT - currentY;
    
    // If dragging down fast, close the modal
    if (velocityY > 1000 && currentHeight < SNAP_POINTS[0]) {
      return 0; // Close
    }
    
    // If dragging up fast, go to largest snap point
    if (velocityY < -1000) {
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
        // Only respond to vertical gestures
        return Math.abs(gestureState.dy) > Math.abs(gestureState.dx) && Math.abs(gestureState.dy) > 10;
      },
      onPanResponderGrant: () => {
        // Stop any ongoing animations
        translateY.stopAnimation();
      },
      onPanResponderMove: (_, gestureState) => {
        const currentY = SCREEN_HEIGHT - currentSnapPoint;
        const newY = currentY + gestureState.dy;
        
        // Constrain the movement
        const minY = SCREEN_HEIGHT - SNAP_POINTS[SNAP_POINTS.length - 1];
        const maxY = SCREEN_HEIGHT;
        
        const constrainedY = Math.max(minY, Math.min(maxY, newY));
        translateY.setValue(constrainedY);
      },
      onPanResponderRelease: (_, gestureState) => {
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
              height: SCREEN_HEIGHT * 0.9, // Max height
              transform: [{ translateY }],
            },
          ]}
        >
          <View 
            style={styles.handleContainer}
            {...panResponder.panHandlers}
          >
            <View style={styles.handle} />
          </View>
          
          <ScrollView 
            style={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            bounces={false}
            keyboardShouldPersistTaps="handled"
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
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  handleContainer: {
    paddingVertical: 12,
    alignItems: 'center',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: colors.grey,
    borderRadius: 2,
  },
  scrollContent: {
    flex: 1,
  },
  content: {
    paddingBottom: 40, // Extra padding at bottom for better UX
  },
});
