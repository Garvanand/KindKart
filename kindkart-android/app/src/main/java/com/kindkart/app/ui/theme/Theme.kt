package com.kindkart.app.ui.theme

import android.app.Activity
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.SideEffect
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.platform.LocalView
import androidx.core.view.WindowCompat

private val KindKartLightColorScheme = lightColorScheme(
    primary = KindKartGreen,
    onPrimary = TextOnPrimary,
    primaryContainer = KindKartGreenLight,
    onPrimaryContainer = KindKartGreenDark,

    secondary = SurfaceMuted,
    onSecondary = TextPrimary,
    secondaryContainer = SurfaceMuted,
    onSecondaryContainer = TextSecondary,

    tertiary = InfoBlue,
    onTertiary = TextOnPrimary,

    background = SurfaceBackground,
    onBackground = TextPrimary,

    surface = SurfaceCard,
    onSurface = TextPrimary,
    surfaceVariant = SurfaceMuted,
    onSurfaceVariant = TextSecondary,

    error = ErrorRed,
    onError = TextOnPrimary,
    errorContainer = Color(0xFFFEE2E2),
    onErrorContainer = Color(0xFF991B1B),

    outline = SurfaceCardBorder,
    outlineVariant = Color(0xFFE5EBE5),

    inverseSurface = TextPrimary,
    inverseOnSurface = SurfaceBackground,
    inversePrimary = KindKartGreenLight,

    surfaceTint = KindKartGreen,
)

@Composable
fun KindKartTheme(
    content: @Composable () -> Unit
) {
    val colorScheme = KindKartLightColorScheme

    val view = LocalView.current
    if (!view.isInEditMode) {
        SideEffect {
            val window = (view.context as Activity).window
            window.statusBarColor = SurfaceBackground.toArgb()
            WindowCompat.getInsetsController(window, view).isAppearanceLightStatusBars = true
        }
    }

    MaterialTheme(
        colorScheme = colorScheme,
        typography = KindKartTypography,
        shapes = KindKartShapes,
        content = content,
    )
}
