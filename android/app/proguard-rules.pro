# ─────────────────────────────────────────────────────────────
# Capacitor Core — Bridge, Plugin annotations, and methods
# ─────────────────────────────────────────────────────────────
-keep @com.getcapacitor.annotation.CapacitorPlugin public class * {
    @com.getcapacitor.annotation.PermissionCallback <methods>;
    @com.getcapacitor.annotation.ActivityCallback <methods>;
    @com.getcapacitor.annotation.Permission <methods>;
    @com.getcapacitor.PluginMethod public <methods>;
}

# Keep all classes that extend Plugin (catches ALL installed plugins)
-keep public class * extends com.getcapacitor.Plugin { *; }

# Keep the entire Capacitor bridge and runtime
-keep class com.getcapacitor.** { *; }
-keepclassmembers class com.getcapacitor.** { *; }

# ─────────────────────────────────────────────────────────────
# Capacitor official plugins (com.capacitorjs.plugins.*)
# Covers: camera, filesystem, share, app, etc.
# ─────────────────────────────────────────────────────────────
-keep class com.capacitorjs.plugins.** { *; }
-keepclassmembers class com.capacitorjs.plugins.** { *; }

# ─────────────────────────────────────────────────────────────
# @capacitor/filesystem — FileProvider, Uri, content provider
# Required for file:// → content:// URI conversion on Android 7+
# ─────────────────────────────────────────────────────────────
-keep class androidx.core.content.FileProvider { *; }
-keep class * extends androidx.core.content.FileProvider { *; }

# ─────────────────────────────────────────────────────────────
# @capacitor/share — uses Intent chooser, ActivityResultContracts
# Intent extras and PendingIntent must not be stripped
# ─────────────────────────────────────────────────────────────
-keep class android.content.Intent { *; }
-keep class android.app.PendingIntent { *; }

# ─────────────────────────────────────────────────────────────
# Capacitor v2 / Cordova compatibility
# ─────────────────────────────────────────────────────────────
-keep @com.getcapacitor.NativePlugin public class * {
    @com.getcapacitor.PluginMethod public <methods>;
}
-keep public class * extends org.apache.cordova.* {
    public <methods>;
    public <fields>;
}

# ─────────────────────────────────────────────────────────────
# WebView JavaScript Interface (required for Capacitor bridge)
# ─────────────────────────────────────────────────────────────
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# ─────────────────────────────────────────────────────────────
# App-specific activity (MainActivity)
# ─────────────────────────────────────────────────────────────
-keep class com.heri.projectapprealis.** { *; }

# ─────────────────────────────────────────────────────────────
# Preserve source file names and line numbers for readable
# stack traces in crash logs / bug reports
# ─────────────────────────────────────────────────────────────
-keepattributes SourceFile,LineNumberTable
-keepattributes *Annotation*
-keepattributes Signature
-keepattributes Exceptions
