import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';

const ARABIC = {
  Fajr:    'الفجر',
  Dhuhr:   'الظهر',
  Asr:     'العصر',
  Maghrib: 'المغرب',
  Isha:    'العشاء',
};

// Durud / Salawat texts — rotated for a little variety
const DURUD_MESSAGES = [
  { title: '🌿 Durud Reminder', body: 'اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ ﷺ' },
  { title: '🌿 Durud Reminder', body: 'اللَّهُمَّ صَلِّ عَلَىٰ سَیِّدِنَا مُحَمَّدٍ ﷺ' },
  { title: '🌿 Durud Reminder', body: 'صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ' },
];

/** Request permission to show notifications. Returns true if granted. */
export const requestNotificationPermission = async () => {
  if (!Device.isDevice) return false; // Skip on simulator

  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;

  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
};

/** Cancel only notifications scheduled with the given data.type tag. */
const cancelByType = async (type) => {
  try {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    const toCancel = scheduled.filter(n => n.content?.data?.type === type);
    await Promise.all(
      toCancel.map(n => Notifications.cancelScheduledNotificationAsync(n.identifier))
    );
  } catch {
    // ignore
  }
};

/**
 * Schedule local notifications for all 5 trackable prayers for today.
 * Cancels any previously scheduled *prayer* notifications first
 * (leaves Durud reminders untouched).
 */
export const schedulePrayerNotifications = async (prayerTimes) => {
  await cancelByType('prayer');

  const trackable = {
    Fajr:    prayerTimes.Fajr,
    Dhuhr:   prayerTimes.Dhuhr,
    Asr:     prayerTimes.Asr,
    Maghrib: prayerTimes.Maghrib,
    Isha:    prayerTimes.Isha,
  };

  const now = new Date();

  for (const [name, time] of Object.entries(trackable)) {
    if (!time || time <= now) continue; // Skip past prayers

    await Notifications.scheduleNotificationAsync({
      content: {
        title: `🕌 ${name} — ${ARABIC[name]}`,
        body:  `It's time for ${name} prayer. Allahu Akbar! 🤲`,
        sound: true,
        data:  { type: 'prayer', prayer: name },
      },
      trigger: { date: time },
    });
  }
};

/** Cancel all scheduled prayer notifications (Durud reminders are untouched). */
export const cancelAllNotifications = async () => {
  await cancelByType('prayer');
};

/**
 * Schedule a repeating Durud / Salawat reminder every `intervalHours` hours.
 * Cancels any previously scheduled Durud reminder first.
 */
export const scheduleDurudReminder = async (intervalHours = 1) => {
  await cancelByType('durud');

  const msg = DURUD_MESSAGES[Math.floor(Math.random() * DURUD_MESSAGES.length)];

  await Notifications.scheduleNotificationAsync({
    content: {
      title: msg.title,
      body:  msg.body,
      sound: true,
      data:  { type: 'durud' },
    },
    trigger: {
      seconds:  Math.max(1, Math.round(intervalHours * 3600)),
      repeats:  true,
    },
  });
};

/** Cancel only the scheduled Durud reminder (prayer notifications are untouched). */
export const cancelDurudReminder = async () => {
  await cancelByType('durud');
};
