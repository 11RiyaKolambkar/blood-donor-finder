import 'package:flutter/foundation.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'web_notification_stub.dart'
    if (dart.library.html) 'web_notification_web.dart' as web_notifications;

final FlutterLocalNotificationsPlugin _localNotifications =
    FlutterLocalNotificationsPlugin();
const _webVapidKey =
    'BEtWZ1tp9qLCNOQZz25IiDdsKaG1b6zUzSEUoOR8uL7CQY3hnWN2ZNKNmCt0QVaLzTE0_A3Ai0DPSgNcOOMevBE';

// Background message handler (must be top-level)
@pragma('vm:entry-point')
Future<void> firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  await NotificationService.showLocalNotification(message);
}

class NotificationService {
  static Future<void> init() async {
    if (kIsWeb) {
      FirebaseMessaging.onMessage.listen((message) {
        final notification = message.notification;
        if (notification != null) {
          web_notifications.showNotification(
            notification.title ?? 'Blood Donor Finder',
            notification.body ?? '',
          );
        }
      });
      return;
    }

    // Request permission
    await FirebaseMessaging.instance.requestPermission(
      alert: true,
      badge: true,
      sound: true,
    );

    // Init local notifications
    const androidInit = AndroidInitializationSettings('@mipmap/ic_launcher');
    const iosInit = DarwinInitializationSettings();
    await _localNotifications.initialize(
      const InitializationSettings(android: androidInit, iOS: iosInit),
    );

    // Foreground notification channel (Android)
    const channel = AndroidNotificationChannel(
      'blood_donor_channel',
      'Blood Donor Alerts',
      description: 'Emergency blood donation notifications',
      importance: Importance.max,
    );
    await _localNotifications
        .resolvePlatformSpecificImplementation<
            AndroidFlutterLocalNotificationsPlugin>()
        ?.createNotificationChannel(channel);

    // Foreground message handler
    FirebaseMessaging.onMessage.listen((message) {
      showLocalNotification(message);
    });

    // Background message handler
    FirebaseMessaging.onBackgroundMessage(firebaseMessagingBackgroundHandler);
  }

  static Future<void> showLocalNotification(RemoteMessage message) async {
    final notification = message.notification;
    if (notification == null) return;
    await _localNotifications.show(
      notification.hashCode,
      notification.title,
      notification.body,
      const NotificationDetails(
        android: AndroidNotificationDetails(
          'blood_donor_channel',
          'Blood Donor Alerts',
          importance: Importance.max,
          priority: Priority.high,
          icon: '@mipmap/ic_launcher',
        ),
      ),
    );
  }

  static Future<String?> getToken() async {
    final messaging = FirebaseMessaging.instance;
    if (kIsWeb) {
      final settings = await messaging.requestPermission(
        alert: true,
        badge: true,
        sound: true,
      );
      if (settings.authorizationStatus != AuthorizationStatus.authorized) {
        debugPrint('Web notification permission was not granted.');
        return null;
      }
      return messaging.getToken(
        vapidKey: _webVapidKey,
      );
    }
    return messaging.getToken();
  }
}
