import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/network/api_client.dart';

final postRepositoryProvider = Provider<PostRepository>((ref) {
  return PostRepository(ref.watch(apiClientProvider));
});

class PostRepository {
  final Dio _dio;

  PostRepository(this._dio);

  Future<void> createPost({
    required String text,
    required List<String> platforms,
    // List<File> media = const [], // Placeholder for real files
  }) async {
    try {
      // In a real scenario, this might be a FormData request with files
      final response = await _dio.post('/social/post', data: {
        'text': text,
        'platforms': platforms,
        'postTypes': ['post'], // Default to standard post
      });

      if (response.statusCode != 200 && response.statusCode != 201) {
        throw Exception('Failed to publish post');
      }
    } on DioException catch (e) {
      if (e.response != null) {
        throw Exception(e.response?.data['message'] ?? 'Publishing failed');
      } else {
        throw Exception('Network error: Unable to connect to server');
      }
    }
  }
}
