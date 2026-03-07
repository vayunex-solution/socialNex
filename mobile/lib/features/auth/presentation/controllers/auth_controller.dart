import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../domain/auth_repository.dart';

final authControllerProvider = NotifierProvider<AuthController, bool>(() {
  return AuthController();
});

class AuthController extends Notifier<bool> {
  String? error;

  @override
  bool build() {
    return false; // Initial state: not loading
  }

  Future<bool> login(String email, String password) async {
    state = true;
    error = null;
    try {
      final repo = ref.read(authRepositoryProvider);
      await repo.login(email, password);
      state = false;
      return true; // Login success
    } catch (e) {
      error = e.toString();
      state = false;
      return false; // Login failed
    }
  }

  Future<void> logout() async {
    await ref.read(authRepositoryProvider).logout();
  }
}
