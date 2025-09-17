
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  Animated,
  TouchableWithoutFeedback,
  Dimensions,
  PanResponder,
} from 'react-native';
import { colors } from '../styles/commonStyles';

interface SimpleBottomSheetProps {
  children?: React.ReactNode;
  isVisible?: boolean;
  onClose?: () => void;
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const SNAP_POINTS = [0, SCREEN_HEIGHT * 0.4, SCREEN_HEIGHT * 0.8];

export default function SimpleBottomSheet({
  children,
  isVisible = false,
  onClose,
}: SimpleBottomSheetProps) {
  const [visible, setVisible] = useState(isVisible);
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isVisible) {
      setVisible(true);
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: SNAP_POINTS[1],
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

  const snapToPoint = (point: number) => {
    Animated.spring(translateY, {
      toValue: point,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();
  };

  const getClosestSnapPoint = (currentY: number, velocityY: number) => {
    const distances = SNAP_POINTS.map(point => Math.abs(point - currentY));
    const closestIndex = distances.indexOf(Math.min(...distances));
    
    if (velocityY > 500 && closestIndex < SNAP_POINTS.length - 1) {
      return SNAP_POINTS[closestIndex + 1];
    } else if (velocityY < -500 && closestIndex > 0) {
      return SNAP_POINTS[closestIndex - 1];
    }
    
    return SNAP_POINTS[closestIndex];
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dy) > 10;
      },
      onPanResponderMove: (_, gestureState) => {
        const newY = SNAP_POINTS[1] + gestureState.dy;
        if (newY >= SNAP_POINTS[0] && newY <= SCREEN_HEIGHT) {
          translateY.setValue(newY);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        const currentY = SNAP_POINTS[1] + gestureState.dy;
        const targetY = getClosestSnapPoint(currentY, gestureState.vy);
        
        if (targetY === SCREEN_HEIGHT || targetY === SNAP_POINTS[0]) {
          onClose?.();
        } else {
          snapToPoint(targetY);
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
    >
      <View style={styles.container}>
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
              transform: [{ translateY }],
            },
          ]}
          {...panResponder.panHandlers}
        >
          <View style={styles.handle} />
          <View style={styles.content}>
            {children}
          </View>
        </Animated.View>
      </View>
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
    minHeight: SCREEN_HEIGHT * 0.4,
    maxHeight: SCREEN_HEIGHT * 0.9,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: colors.grey,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  content: {
    flex: 1,
  },
});
