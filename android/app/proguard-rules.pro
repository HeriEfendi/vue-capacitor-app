# Add project specific ProGuard rules here.
# You can control the set of applied configuration files using the
# proguardFiles setting in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# Keep Capacitor core plugin annotations and methods
-keep @com.getcapacitor.annotation.CapacitorPlugin public class * {
    @com.getcapacitor.annotation.PermissionCallback <methods>;
    @com.getcapacitor.annotation.ActivityCallback <methods>;
    @com.getcapacitor.annotation.Permission <methods>;
    @com.getcapacitor.PluginMethod public <methods>;
}

# Keep all class files that extend the Plugin class
-keep public class * extends com.getcapacitor.Plugin { *; }

# Keep all classes in Capacitor package
-keep class com.getcapacitor.** { *; }

# Keep all plugins in Capacitor-plugins package
-keep class com.capacitorjs.plugins.** { *; }

# Keep JS interface for webview
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# Preserve the line number information for debugging stack traces.
-keepattributes SourceFile,LineNumberTable
