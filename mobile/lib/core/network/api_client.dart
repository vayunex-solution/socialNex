import 'dart:convert';
import 'package:crypto/crypto.dart';
import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

// In production, this must be obfuscated or fetched securely
const String _appSecret = 'vayunex_socialnex_secure_secret_2026';

// Provides a singleton instance of secure storage
final secureStorageProvider = Provider<FlutterSecureStorage>((ref) {
  return const FlutterSecureStorage(
    aOptions: AndroidOptions(encryptedSharedPreferences: true),
    iOptions: IOSOptions(accessibility: KeychainAccessibility.first_unlock),
  );
});

// Provides the Dio API client ready for use
final apiClientProvider = Provider<Dio>((ref) {
  final secureStorage = ref.watch(secureStorageProvider);

  // TODO: Point this to the correct production/staging URL before release
  final dio = Dio(BaseOptions(
    baseUrl: 'https://socialnex.vayunexsolution.com/api', // Adjust base URL as needed
    connectTimeout: const Duration(seconds: 15),
    receiveTimeout: const Duration(seconds: 15),
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
  ));

  // Add interceptors
  dio.interceptors.add(InterceptorsWrapper(
    onRequest: (options, handler) async {
      // 1. Inject Authorization Token
      final token = await secureStorage.read(key: 'accessToken');
      if (token != null) {
        options.headers['Authorization'] = 'Bearer $token';
      }

      // 2. Inject HMAC Signature (X-Signature) for payload integrity
      final timestamp = DateTime.now().millisecondsSinceEpoch.toString();
      String payload = '';
      
      if (options.data != null) {
        payload = jsonEncode(options.data);
      } else {
        payload = options.path; // Use path if no body
      }

      final dataToSign = '$timestamp:$payload';
      final hmac = Hmac(sha256, utf8.encode(_appSecret));
      final signature = hmac.convert(utf8.encode(dataToSign)).toString();

      options.headers['X-Timestamp'] = timestamp;
      options.headers['X-Signature'] = signature;

      return handler.next(options);
    },
    onResponse: (response, handler) {
      return handler.next(response);
    },
    onError: (DioException e, handler) async {
      // Handle 401 Unauthorized (Token Expiry)
      if (e.response?.statusCode == 401) {
        // TODO: Implement token refresh logic or trigger logout
        // For MVP, just log out if 401
        await secureStorage.delete(key: 'accessToken');
      }
      return handler.next(e);
    },
  ));

  return dio;
});
