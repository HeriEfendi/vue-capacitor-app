import { Capacitor } from '@capacitor/core'
import { ReminderItem, getNextOccurrence, daysUntil } from '@/db/reminderRepository'

/**
 * Reschedule semua notifikasi pengingat.
 * - Hanya jalan di native Android/iOS
 * - Untuk setiap reminder, jadwalkan notif sesuai notifyMode:
 *     'on_day'  → notif di hari H saja
 *     '3_days'  → notif 3 hari, 2 hari, 1 hari, dan hari H
 *     '7_days'  → notif 7, 6, 5, 4, 3, 2, 1 hari sebelum + hari H
 */
export async function scheduleReminderNotifications(reminders: ReminderItem[]) {
  if (!Capacitor.isNativePlatform()) return

  try {
    const { LocalNotifications } = await import('@capacitor/local-notifications')

    let perm = await LocalNotifications.checkPermissions()
    if (perm.display !== 'granted') perm = await LocalNotifications.requestPermissions()
    if (perm.display !== 'granted') return

    await LocalNotifications.createChannel({
      id: 'reminders',
      name: 'Pengingat',
      description: 'Notifikasi hari-hari penting',
      importance: 4,
      sound: 'default',
      vibration: true,
    })

    // Batalkan semua notif pengingat lama (id range 90000–99999)
    const pending = await LocalNotifications.getPending()
    const old = pending.notifications.filter(n => n.id >= 90000 && n.id < 100000)
    if (old.length > 0) await LocalNotifications.cancel({ notifications: old })

    const notifications: any[] = []
    let notifIdx = 0

    reminders.forEach(r => {
      const nextDate = getNextOccurrence(r)
      if (!nextDate) return

      const [hh, mm2] = (r.notifyTime || '08:00').split(':').map(Number)

      // Berapa hari sebelumnya mulai mengingatkan
      const leadDays = r.notifyMode === '7_days' ? 7 : r.notifyMode === '3_days' ? 3 : 0

      for (let offset = leadDays; offset >= 0; offset--) {
        const atDate = new Date(nextDate)
        atDate.setDate(atDate.getDate() - offset)
        atDate.setHours(hh, mm2, 0, 0)

        if (atDate <= new Date()) continue // skip yang sudah lewat

        let title = `${r.emoji || '📅'} ${r.title}`
        let body: string
        if (offset === 0) {
          body = `Hari ini adalah hari spesial!${r.notes ? ' ' + r.notes : ''}`
        } else if (offset === 1) {
          body = `Besok: ${r.title}. Jangan sampai lupa!`
        } else {
          body = `${r.title} — tinggal ${offset} hari lagi!`
        }

        notifications.push({
          id: 90000 + notifIdx++,
          title,
          body,
          schedule: { at: atDate },
          channelId: 'reminders',
          smallIcon: 'ic_stat_icon_config_sample',
          iconColor: offset === 0 ? '#6366f1' : '#f59e0b',
        })
      }
    })

    if (notifications.length > 0) {
      await LocalNotifications.schedule({ notifications })
    }
  } catch (e) {
    console.warn('Reminder notification scheduling failed:', e)
  }
}
