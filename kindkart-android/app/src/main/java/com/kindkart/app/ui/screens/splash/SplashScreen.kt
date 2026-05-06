package com.kindkart.app.ui.screens.splash

import androidx.compose.animation.core.*
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.draw.scale
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import com.kindkart.app.ui.theme.*
import kotlinx.coroutines.delay

@Composable
fun SplashScreen(
    onNavigateToAuth: () -> Unit,
    onNavigateToHome: () -> Unit,
    viewModel: SplashViewModel = hiltViewModel(),
) {
    val isLoggedIn by viewModel.isLoggedIn.collectAsState()

    // Animations
    val infiniteTransition = rememberInfiniteTransition(label = "splash")
    val glowAlpha by infiniteTransition.animateFloat(
        initialValue = 0.3f, targetValue = 0.8f,
        animationSpec = infiniteRepeatable(tween(1500), RepeatMode.Reverse),
        label = "glow"
    )
    val logoScale by animateFloatAsState(
        targetValue = 1f,
        animationSpec = spring(dampingRatio = 0.6f, stiffness = 200f),
        label = "scale"
    )
    val textAlpha by animateFloatAsState(
        targetValue = 1f,
        animationSpec = tween(800, delayMillis = 400),
        label = "textFade"
    )

    LaunchedEffect(isLoggedIn) {
        delay(1800)
        if (isLoggedIn == true) onNavigateToHome()
        else if (isLoggedIn == false) onNavigateToAuth()
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(
                Brush.verticalGradient(
                    listOf(SurfaceBackground, SurfaceCard)
                )
            ),
        contentAlignment = Alignment.Center,
    ) {
        // Glow circle behind logo
        Box(
            modifier = Modifier
                .size(200.dp)
                .alpha(glowAlpha)
                .background(
                    Brush.radialGradient(
                        listOf(KindKartGreen.copy(alpha = 0.15f), SurfaceBackground.copy(alpha = 0f))
                    )
                )
        )

        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            modifier = Modifier.scale(logoScale),
        ) {
            // Logo circle
            Box(
                modifier = Modifier
                    .size(80.dp)
                    .background(
                        Brush.linearGradient(listOf(KindKartGreen, KindKartGreenLight)),
                        shape = androidx.compose.foundation.shape.RoundedCornerShape(20.dp)
                    ),
                contentAlignment = Alignment.Center,
            ) {
                Text(
                    text = "K",
                    fontSize = 36.sp,
                    fontWeight = FontWeight.Bold,
                    color = TextOnPrimary,
                )
            }

            Spacer(Modifier.height(20.dp))

            Text(
                text = "KindKart",
                style = MaterialTheme.typography.displayMedium,
                color = TextPrimary,
                fontWeight = FontWeight.Bold,
                modifier = Modifier.alpha(textAlpha),
            )

            Spacer(Modifier.height(4.dp))

            Text(
                text = "Neighborhood OS",
                style = MaterialTheme.typography.bodyMedium,
                color = TextSecondary,
                modifier = Modifier.alpha(textAlpha),
            )
        }

        // Bottom credit
        Text(
            text = "Built by Garv Anand • VIT",
            style = MaterialTheme.typography.labelSmall,
            color = TextSecondary.copy(alpha = 0.5f),
            modifier = Modifier
                .align(Alignment.BottomCenter)
                .padding(bottom = 32.dp)
                .alpha(textAlpha),
        )
    }
}
