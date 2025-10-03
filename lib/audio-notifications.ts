// Audio notification utilities for real-time alerts

export const playNotificationSound = (type: 'message' | 'report' | 'mortality' | 'alert' = 'alert') => {
  try {
    // Create a simple beep sound using Web Audio API
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    
    // Create oscillator for different sound types
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()
    
    // Configure frequency based on notification type
    let frequency = 800 // Default frequency
    switch (type) {
      case 'message':
        frequency = 600
        break
      case 'report':
        frequency = 700
        break
      case 'mortality':
        frequency = 1000 // Higher frequency for urgent alerts
        break
      case 'alert':
        frequency = 800
        break
    }
    
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime)
    oscillator.type = 'sine'
    
    // Configure gain for volume control
    gainNode.gain.setValueAtTime(0, audioContext.currentTime)
    gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.01)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)
    
    // Connect nodes
    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)
    
    // Play the sound
    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + 0.5)
    
  } catch (error) {
    console.log('Could not play notification sound:', error)
    // Fallback to system beep
    console.log('\a')
  }
}

export const playCriticalAlert = () => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    
    // Play a sequence of beeps for critical alerts
    const playBeep = (frequency: number, startTime: number) => {
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime + startTime)
      oscillator.type = 'sine'
      
      gainNode.gain.setValueAtTime(0, audioContext.currentTime + startTime)
      gainNode.gain.linearRampToValueAtTime(0.2, audioContext.currentTime + startTime + 0.01)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + startTime + 0.3)
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      oscillator.start(audioContext.currentTime + startTime)
      oscillator.stop(audioContext.currentTime + startTime + 0.3)
    }
    
    // Play three beeps for critical alerts
    playBeep(1000, 0)
    playBeep(1000, 0.4)
    playBeep(1000, 0.8)
    
  } catch (error) {
    console.log('Could not play critical alert sound:', error)
    console.log('\a\a\a') // Triple beep fallback
  }
}
