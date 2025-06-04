import React, { useState, useEffect, useCallback } from 'react'
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native'
import { useNavigation, useIsFocused } from '@react-navigation/native'
import ScreenWrapper from '../../components/common/ScreenWrapper'
import AppButton from '../../components/common/AppButton'
import Card from '../../components/common/Card' // Import Card
import theme, { COLORS, FONTS, SIZES } from '../../constants/theme' // Import SIZES, FONTS, COLORS directly
import { getTasks, deleteTask } from '../../database/database'
import { Ionicons } from '@expo/vector-icons'

const TaskListScreen = () => {
  const navigation = useNavigation()
  const isFocused = useIsFocused()
  const [tasks, setTasks] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const loadTasks = useCallback(async () => {
    console.log('[TaskListScreen] Attempting to load tasks...')
    setIsLoading(true)
    setError(null)
    try {
      const fetchedTasks = await getTasks()
      console.log('[TaskListScreen] Fetched tasks:', fetchedTasks.length)
      setTasks(fetchedTasks)
    } catch (err) {
      console.error('[TaskListScreen] Error loading tasks:', err)
      setError('Failed to load tasks. Please try again.')
      Alert.alert('Error', 'Failed to load tasks. Pull down to refresh.')
    }
    setIsLoading(false)
  }, [])

  useEffect(() => {
    if (isFocused) {
      console.log('[TaskListScreen] Screen focused, loading tasks.')
      loadTasks()
    }
  }, [isFocused, loadTasks])

  const handleDeleteTask = async (taskId) => {
    Alert.alert('Confirm Delete', 'Are you sure you want to delete this task? This action cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          setIsLoading(true)
          try {
            const changes = await deleteTask(taskId)
            if (changes > 0) {
              Alert.alert('Success', 'Task deleted successfully.')
              loadTasks() // Refresh the list
            } else {
              Alert.alert('Info', 'Task could not be deleted. It might have already been removed or does not exist.')
            }
          } catch (err) {
            console.error('[TaskListScreen] Error deleting task:', err)
            Alert.alert('Error', 'Failed to delete task. Please try again.')
          } finally {
            setIsLoading(false)
          }
        },
      },
    ])
  }

  const renderTaskItem = ({ item }) => (
    <Card style={styles.taskCard}>
      <TouchableOpacity
        style={styles.cardContent}
        onPress={() => navigation.navigate('AddEditTask', { taskId: item.id })}
      >
        <View style={styles.taskInfoContainer}>
          <Text style={styles.taskTitle}>{item.title}</Text>
          <Text style={styles.taskDetailText}>Customer: {item.customerName || 'N/A'}</Text>
          <Text style={styles.taskDetailText}>
            Vehicle:
            {item.vehicleMake && item.vehicleModel
              ? `${item.vehicleMake} ${item.vehicleModel} (${item.vehicleYear || 'N/A'})`
              : 'N/A'}
          </Text>
          <Text style={styles.taskDetailText}>Category: {item.category || 'N/A'}</Text>
        </View>
        <View style={styles.statusContainer}>
          <Text style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>{item.status}</Text>
        </View>
      </TouchableOpacity>
      <View style={styles.buttonContainer}>
        <AppButton
          title='Edit'
          onPress={() => navigation.navigate('AddEditTask', { taskId: item.id })}
          style={styles.actionButton}
          textStyle={styles.actionButtonText}
          variant='primary'
          size='small'
          icon={<Ionicons name='pencil-outline' size={16} color={COLORS.white} style={{ marginRight: 4 }} />}
        />
        <AppButton
          title='Delete'
          onPress={() => handleDeleteTask(item.id)}
          style={styles.actionButton}
          textStyle={styles.actionButtonText}
          variant='error'
          size='small'
          icon={<Ionicons name='trash-outline' size={16} color={COLORS.white} style={{ marginRight: 4 }} />}
        />
      </View>
    </Card>
  )

  const getStatusColor = (status) => {
    switch (status) {
      case 'To Do':
        return COLORS.primary
      case 'In Progress':
        return COLORS.accent
      case 'Awaiting Parts':
        return COLORS.warning
      case 'Completed':
        return COLORS.success
      case 'Cancelled':
        return COLORS.error
      default:
        return COLORS.textSecondary
    }
  }

  if (isLoading && !tasks.length) {
    return (
      <ScreenWrapper>
        <View style={styles.centeredMessageContainer}>
          <ActivityIndicator size='large' color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading Tasks...</Text>
        </View>
      </ScreenWrapper>
    )
  }

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <AppButton
          title='Add New Task'
          onPress={() => navigation.navigate('AddEditTask')}
          style={styles.addButton}
          icon={<Ionicons name='add-circle-outline' size={22} color={COLORS.white} style={{ marginRight: 8 }} />}
        />
        {tasks.length === 0 && !isLoading && (
          <View style={styles.centeredMessageContainer}>
            <Ionicons name='file-tray-outline' size={60} color={COLORS.textSecondary} />
            <Text style={styles.emptyListText}>{error || "No tasks found. Tap 'Add New Task' to get started!"}</Text>
            {error && <AppButton title='Retry' onPress={loadTasks} style={{ marginTop: SIZES.medium }} />}
          </View>
        )}
        <FlatList
          data={tasks}
          renderItem={renderTaskItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContentContainer}
          showsVerticalScrollIndicator={false}
          onRefresh={loadTasks}
          refreshing={isLoading}
        />
      </View>
    </ScreenWrapper>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: SIZES.padding,
    paddingTop: SIZES.padding,
  },
  listContentContainer: {
    paddingBottom: SIZES.padding, // Adjusted from padding to paddingBottom
    flexGrow: 1,
  },
  taskCard: {
    marginBottom: SIZES.medium,
    // Card component might handle its own internal padding, adjust if needed
  },
  cardContent: {
    // Wraps content inside Card, excluding action buttons
    padding: SIZES.padding, // Add padding here if not in Card or if more is needed
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  taskInfoContainer: {
    flex: 1,
    marginRight: SIZES.small,
  },
  taskTitle: {
    fontSize: SIZES.large,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginBottom: SIZES.extraSmall,
  },
  taskDetailText: {
    fontSize: SIZES.small,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    marginBottom: SIZES.tiny,
  },
  statusContainer: {
    // Removed flexDirection: "row" as it's part of cardContent now
    alignItems: 'center', // Keep alignment for badge
  },
  statusBadge: {
    fontSize: SIZES.small,
    fontFamily: FONTS.semiBold,
    color: COLORS.white,
    paddingVertical: SIZES.tiny,
    paddingHorizontal: SIZES.small,
    borderRadius: SIZES.large,
    overflow: 'hidden',
    textAlign: 'center',
    minWidth: 80,
    // marginRight: SIZES.extraSmall, // Removed as chevron is removed
  },
  addButton: {
    marginBottom: SIZES.padding,
    backgroundColor: COLORS.primary,
  },
  centeredMessageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.large,
  },
  emptyListText: {
    textAlign: 'center',
    marginTop: SIZES.medium,
    fontSize: SIZES.medium,
    color: COLORS.textSecondary,
    fontFamily: FONTS.regular,
  },
  loadingText: {
    marginTop: SIZES.small,
    fontSize: SIZES.medium,
    color: COLORS.textSecondary,
    fontFamily: FONTS.regular,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: SIZES.padding,
    paddingBottom: SIZES.padding,
    paddingTop: SIZES.base, // Add some space above buttons
    borderTopWidth: 1,
    borderTopColor: COLORS.border, // Use a border color from theme
  },
  actionButton: {
    marginHorizontal: SIZES.base / 2,
    flex: 1, // Make buttons take equal width
  },
  actionButtonText: {
    fontFamily: FONTS.semiBold,
    // color: COLORS.white, // Handled by AppButton variant
  },
})

export default TaskListScreen
