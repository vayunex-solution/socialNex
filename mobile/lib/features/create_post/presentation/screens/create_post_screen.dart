import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../core/theme/theme_provider.dart';
import '../controllers/post_controller.dart';

class CreatePostScreen extends ConsumerStatefulWidget {
  const CreatePostScreen({super.key});

  @override
  ConsumerState<CreatePostScreen> createState() => _CreatePostScreenState();
}

class _CreatePostScreenState extends ConsumerState<CreatePostScreen> {
  final TextEditingController _contentController = TextEditingController();
  final List<String> _selectedPlatforms = []; // e.g. 'facebook', 'instagram'
  
  // Dummy platforms to simulate state
  final List<Map<String, dynamic>> _connectedPlatforms = [
    {'id': '1', 'name': 'facebook', 'label': 'FB Page'},
    {'id': '2', 'name': 'instagram', 'label': 'Insta Biz'},
    {'id': '3', 'name': 'linkedin', 'label': 'LinkedIn'},
    {'id': '4', 'name': 'twitter', 'label': 'X (Twitter)'},
  ];

  @override
  void dispose() {
    _contentController.dispose();
    super.dispose();
  }

  void _togglePlatform(String platform) {
    setState(() {
      if (_selectedPlatforms.contains(platform)) {
        _selectedPlatforms.remove(platform);
      } else {
        _selectedPlatforms.add(platform);
      }
    });
  }

  Future<void> _handlePublish() async {
    FocusScope.of(context).unfocus(); // Dismiss keyboard
    final success = await ref.read(postControllerProvider.notifier).publishPost(
      text: _contentController.text,
      platforms: _selectedPlatforms,
    );

    if (mounted) {
      if (success) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Post published successfully!'), backgroundColor: Colors.green),
        );
        setState(() {
          _contentController.clear();
          _selectedPlatforms.clear();
        });
      } else {
        final error = ref.read(postControllerProvider.notifier).error;
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(error?.toString() ?? 'Failed to publish post.'), backgroundColor: Colors.redAccent),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final themeMode = ref.watch(themeProvider);
    final isDark = themeMode == ThemeMode.dark || 
                   (themeMode == ThemeMode.system && MediaQuery.platformBrightnessOf(context) == Brightness.dark);
    
    final isPublishing = ref.watch(postControllerProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('New Post'),
        actions: [
          TextButton(
            onPressed: isPublishing ? null : _handlePublish,
            child: isPublishing 
                ? SizedBox(
                    width: 20.w, 
                    height: 20.w, 
                    child: CircularProgressIndicator(strokeWidth: 2, valueColor: AlwaysStoppedAnimation<Color>(AppTheme.primary))
                  )
                : Text(
                    'Publish',
                    style: TextStyle(
                      color: isPublishing ? Colors.grey : AppTheme.primary,
                      fontWeight: FontWeight.bold,
                      fontSize: 16.sp,
                    ),
                  ),
          ),
          SizedBox(width: 8.w),
        ],
      ),
      body: SingleChildScrollView(
        padding: EdgeInsets.all(16.w),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // 1. Platform Selector
            Text(
              'Select Destinations',
              style: Theme.of(context).textTheme.titleLarge?.copyWith(fontSize: 18.sp),
            ),
            SizedBox(height: 12.h),
            SizedBox(
              height: 50.h,
              child: ListView.builder(
                scrollDirection: Axis.horizontal,
                itemCount: _connectedPlatforms.length,
                itemBuilder: (context, index) {
                  final platform = _connectedPlatforms[index];
                  final isSelected = _selectedPlatforms.contains(platform['name']);
                  return GestureDetector(
                    onTap: () => _togglePlatform(platform['name']),
                    child: Container(
                      margin: EdgeInsets.only(right: 12.w),
                      padding: EdgeInsets.symmetric(horizontal: 16.w, vertical: 8.h),
                      decoration: BoxDecoration(
                        color: isSelected 
                            ? AppTheme.primary.withOpacity(isDark ? 0.2 : 0.1) 
                            : (isDark ? AppTheme.surface : AppTheme.surfaceLightHover),
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(
                          color: isSelected ? AppTheme.primary : Colors.transparent,
                        ),
                      ),
                      child: Row(
                        children: [
                          Icon(
                            _getIconForPlatform(platform['name']), 
                            size: 18.sp,
                            color: isSelected 
                                ? AppTheme.primary 
                                : (isDark ? AppTheme.textSub : AppTheme.textSubLight),
                          ),
                          SizedBox(width: 8.w),
                          Text(
                            platform['label'],
                            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                              color: isSelected 
                                  ? AppTheme.primary 
                                  : (isDark ? AppTheme.textSub : AppTheme.textSubLight),
                              fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                            ),
                          ),
                        ],
                      ),
                    ),
                  );
                },
              ),
            ),
            
            SizedBox(height: 24.h),
            
            // 2. Text Input Area
            Container(
              decoration: isDark ? AppTheme.glassBoxDecoDark : BoxDecoration(
                color: AppTheme.surfaceLightObj,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: Colors.black.withOpacity(0.05)),
              ),
              child: TextField(
                controller: _contentController,
                maxLines: 8,
                minLines: 5,
                decoration: InputDecoration(
                  hintText: 'What do you want to share?',
                  border: InputBorder.none,
                  enabledBorder: InputBorder.none,
                  focusedBorder: InputBorder.none,
                  filled: false,
                  contentPadding: EdgeInsets.all(16.w),
                ),
              ),
            ),
            
            SizedBox(height: 24.h),
            
            // 3. Media Upload Area
            GestureDetector(
              onTap: () {
                // Implement Image picker
              },
              child: Container(
                height: 120.h,
                decoration: BoxDecoration(
                  color: isDark ? AppTheme.surface : AppTheme.surfaceLightHover,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(
                    color: isDark ? Colors.white.withOpacity(0.1) : Colors.black.withOpacity(0.05),
                    style: BorderStyle.solid,
                  ),
                ),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(
                      Icons.cloud_upload_outlined,
                      size: 40.sp,
                      color: isDark ? AppTheme.textSub : AppTheme.textSubLight,
                    ),
                    SizedBox(height: 8.h),
                    Text(
                      'Tap to upload media',
                      style: Theme.of(context).textTheme.bodyMedium,
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  IconData _getIconForPlatform(String name) {
    switch (name) {
      case 'facebook': return Icons.facebook;
      case 'instagram': return Icons.camera_alt_outlined; // Use custom SVG later
      case 'linkedin': return Icons.work_outline;
      case 'twitter': return Icons.alternate_email;
      default: return Icons.public;
    }
  }
}
