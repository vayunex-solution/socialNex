import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../domain/post_repository.dart';

final postControllerProvider = NotifierProvider<PostController, bool>(() {
  return PostController();
});

class PostController extends Notifier<bool> {
  String? error;

  @override
  bool build() {
    return false; // Initial state: not loading
  }

  Future<bool> publishPost({required String text, required List<String> platforms}) async {
    if (text.isEmpty && platforms.isEmpty) {
      error = 'Content and target platforms cannot be empty';
      return false;
    }
    
    if (platforms.isEmpty) {
      error = 'Please select at least one platform';
      return false;
    }

    state = true;
    error = null;
    try {
      final repo = ref.read(postRepositoryProvider);
      await repo.createPost(text: text, platforms: platforms);
      state = false;
      return true;
    } catch (e) {
      error = e.toString();
      state = false;
      return false;
    }
  }
}
