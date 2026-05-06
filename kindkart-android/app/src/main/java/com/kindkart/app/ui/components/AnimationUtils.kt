package com.kindkart.app.ui.components

import androidx.compose.animation.*
import androidx.compose.animation.core.*
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.interaction.collectIsPressedAsState
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Favorite
import androidx.compose.material.icons.outlined.FavoriteBorder
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.scale
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.hapticfeedback.HapticFeedbackType
import androidx.compose.ui.platform.LocalHapticFeedback
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.kindkart.app.ui.theme.*

// ===== Animated Scale Button (bouncy press effect) =====
@Composable
fun AnimatedScaleButton(
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    enabled: Boolean = true,
    containerColor: Color = KindKartGreen,
    contentColor: Color = TextOnPrimary,
    withHaptic: Boolean = false,
    content: @Composable RowScope.() -> Unit,
) {
    val interactionSource = remember { MutableInteractionSource() }
    val isPressed by interactionSource.collectIsPressedAsState()
    val haptic = LocalHapticFeedback.current

    val scale by animateFloatAsState(
        targetValue = if (isPressed) 0.95f else 1f,
        animationSpec = spring(dampingRatio = 0.5f, stiffness = 400f),
        label = "buttonScale"
    )

    Button(
        onClick = {
            if (withHaptic) haptic.performHapticFeedback(HapticFeedbackType.LongPress)
            onClick()
        },
        modifier = modifier.scale(scale),
        enabled = enabled,
        shape = RoundedCornerShape(24.dp),
        colors = ButtonDefaults.buttonColors(containerColor = containerColor, contentColor = contentColor),
        interactionSource = interactionSource,
        content = content,
    )
}

// ===== Animated Heart Toggle =====
@Composable
fun AnimatedHeartToggle(
    isLiked: Boolean,
    onToggle: (Boolean) -> Unit,
    modifier: Modifier = Modifier,
) {
    val haptic = LocalHapticFeedback.current
    val scale by animateFloatAsState(
        targetValue = if (isLiked) 1f else 0.8f,
        animationSpec = spring(dampingRatio = 0.4f, stiffness = 500f),
        label = "heartScale"
    )
    val color by animateColorAsState(
        targetValue = if (isLiked) ErrorRed else TextSecondary,
        animationSpec = tween(300),
        label = "heartColor"
    )

    IconButton(
        onClick = {
            if (!isLiked) haptic.performHapticFeedback(HapticFeedbackType.LongPress)
            onToggle(!isLiked)
        },
        modifier = modifier.scale(scale),
    ) {
        Icon(
            imageVector = if (isLiked) Icons.Filled.Favorite else Icons.Outlined.FavoriteBorder,
            contentDescription = if (isLiked) "Unlike" else "Like",
            tint = color,
        )
    }
}

// ===== Count Up Animation =====
@Composable
fun CountUpText(
    targetValue: Int,
    modifier: Modifier = Modifier,
    prefix: String = "",
    suffix: String = "",
    style: androidx.compose.ui.text.TextStyle = MaterialTheme.typography.headlineMedium,
    color: Color = TextPrimary,
    fontWeight: FontWeight = FontWeight.Bold,
) {
    var animatedValue by remember { mutableIntStateOf(0) }
    LaunchedEffect(targetValue) {
        animatedValue = 0
        val steps = 30
        val step = targetValue / steps.coerceAtLeast(1)
        for (i in 1..steps) {
            kotlinx.coroutines.delay(16)
            animatedValue = (step * i).coerceAtMost(targetValue)
        }
        animatedValue = targetValue
    }
    Text(
        text = "$prefix$animatedValue$suffix",
        style = style,
        color = color,
        fontWeight = fontWeight,
        modifier = modifier,
    )
}

// ===== Animated Circular Progress (for Karma score) =====
@Composable
fun AnimatedCircularProgress(
    progress: Float,
    modifier: Modifier = Modifier,
    size: Dp = 120.dp,
    strokeWidth: Dp = 8.dp,
    trackColor: Color = SurfaceMuted,
    progressColor: Color = KindKartGreen,
    content: @Composable () -> Unit = {},
) {
    val animatedProgress by animateFloatAsState(
        targetValue = progress.coerceIn(0f, 1f),
        animationSpec = tween(durationMillis = 1000, easing = FastOutSlowInEasing),
        label = "circProgress"
    )

    Box(modifier = modifier.size(size), contentAlignment = Alignment.Center) {
        androidx.compose.foundation.Canvas(modifier = Modifier.fillMaxSize()) {
            val sweep = animatedProgress * 360f
            drawArc(
                color = trackColor,
                startAngle = -90f,
                sweepAngle = 360f,
                useCenter = false,
                style = Stroke(width = strokeWidth.toPx(), cap = StrokeCap.Round)
            )
            drawArc(
                color = progressColor,
                startAngle = -90f,
                sweepAngle = sweep,
                useCenter = false,
                style = Stroke(width = strokeWidth.toPx(), cap = StrokeCap.Round)
            )
        }
        content()
    }
}

// ===== Slide In Item (staggered entrance) =====
@Composable
fun SlideInItem(
    index: Int,
    modifier: Modifier = Modifier,
    content: @Composable () -> Unit,
) {
    var visible by remember { mutableStateOf(false) }
    LaunchedEffect(Unit) {
        kotlinx.coroutines.delay(index * 50L)
        visible = true
    }
    AnimatedVisibility(
        visible = visible,
        enter = fadeIn(tween(300)) + slideInVertically(
            initialOffsetY = { it / 3 },
            animationSpec = tween(300, easing = FastOutSlowInEasing)
        ),
        modifier = modifier,
    ) {
        content()
    }
}

// ===== Pulse Effect =====
@Composable
fun PulseEffect(
    modifier: Modifier = Modifier,
    color: Color = KindKartGreen,
    content: @Composable () -> Unit,
) {
    val infiniteTransition = rememberInfiniteTransition(label = "pulse")
    val scale by infiniteTransition.animateFloat(
        initialValue = 1f,
        targetValue = 1.08f,
        animationSpec = infiniteRepeatable(
            animation = tween(800, easing = FastOutSlowInEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "pulseScale"
    )
    Box(modifier = modifier.scale(scale)) {
        content()
    }
}

// ===== Animated Badge Chip =====
@Composable
fun AnimatedBadgeChip(
    icon: String,
    label: String,
    isUnlocked: Boolean,
    modifier: Modifier = Modifier,
) {
    val alpha by animateFloatAsState(
        targetValue = if (isUnlocked) 1f else 0.35f,
        animationSpec = tween(400),
        label = "badgeAlpha"
    )
    val scale by animateFloatAsState(
        targetValue = if (isUnlocked) 1f else 0.9f,
        animationSpec = spring(dampingRatio = 0.6f),
        label = "badgeScale"
    )

    Card(
        modifier = modifier
            .graphicsLayer(alpha = alpha, scaleX = scale, scaleY = scale),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(
            containerColor = if (isUnlocked) LandingAccentBg else SurfaceMuted
        ),
        border = if (isUnlocked) {
            androidx.compose.foundation.BorderStroke(1.dp, KindKartGreen.copy(alpha = 0.3f))
        } else null,
    ) {
        Column(
            modifier = Modifier.padding(12.dp).widthIn(min = 80.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
        ) {
            Text(icon, fontSize = 24.sp)
            Spacer(Modifier.height(4.dp))
            Text(
                label,
                style = MaterialTheme.typography.labelSmall,
                color = if (isUnlocked) TextPrimary else TextTertiary,
                fontWeight = if (isUnlocked) FontWeight.SemiBold else FontWeight.Normal,
            )
        }
    }
}

// ===== Streak Flame =====
@Composable
fun StreakFlame(
    streakDays: Int,
    modifier: Modifier = Modifier,
) {
    val infiniteTransition = rememberInfiniteTransition(label = "flame")
    val flameScale by infiniteTransition.animateFloat(
        initialValue = 0.95f,
        targetValue = 1.1f,
        animationSpec = infiniteRepeatable(
            animation = tween(600, easing = FastOutSlowInEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "flameScale"
    )

    Row(
        modifier = modifier,
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(6.dp),
    ) {
        Text(
            "🔥",
            fontSize = 20.sp,
            modifier = Modifier.scale(if (streakDays > 0) flameScale else 1f),
        )
        Column {
            Text(
                "$streakDays day streak",
                style = MaterialTheme.typography.labelLarge,
                color = TextPrimary,
                fontWeight = FontWeight.Bold,
            )
            if (streakDays > 0) {
                Text(
                    "Keep going!",
                    style = MaterialTheme.typography.labelSmall,
                    color = WarningAmber,
                )
            }
        }
    }
}

// ===== Shimmer Loading List =====
@Composable
fun ShimmerLoadingList(itemCount: Int = 4) {
    Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
        repeat(itemCount) {
            ShimmerCard()
        }
    }
}

// ===== Animated Appreciation Message =====
@Composable
fun AppreciationMessage(
    message: String,
    visible: Boolean,
    modifier: Modifier = Modifier,
) {
    AnimatedVisibility(
        visible = visible,
        enter = fadeIn(tween(500)) + scaleIn(
            initialScale = 0.8f,
            animationSpec = spring(dampingRatio = 0.5f)
        ),
        exit = fadeOut(tween(300)),
        modifier = modifier,
    ) {
        Card(
            shape = RoundedCornerShape(20.dp),
            colors = CardDefaults.cardColors(containerColor = LandingAccentBg),
            border = androidx.compose.foundation.BorderStroke(1.dp, KindKartGreen.copy(alpha = 0.2f)),
        ) {
            Text(
                text = message,
                style = MaterialTheme.typography.bodyMedium,
                color = KindKartGreenDark,
                fontWeight = FontWeight.Medium,
                modifier = Modifier.padding(horizontal = 20.dp, vertical = 12.dp),
            )
        }
    }
}

// ===== Nudge Card =====
@Composable
fun NudgeCard(
    message: String,
    modifier: Modifier = Modifier,
) {
    var visible by remember { mutableStateOf(false) }
    LaunchedEffect(Unit) {
        kotlinx.coroutines.delay(300)
        visible = true
    }

    AnimatedVisibility(
        visible = visible,
        enter = fadeIn(tween(600)) + expandVertically(tween(400)),
        modifier = modifier,
    ) {
        Card(
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = LandingAccentBg),
            border = androidx.compose.foundation.BorderStroke(1.dp, KindKartGreen.copy(alpha = 0.15f)),
        ) {
            Row(
                modifier = Modifier.padding(16.dp).fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Text("💡", fontSize = 20.sp)
                Spacer(Modifier.width(12.dp))
                Text(
                    message,
                    style = MaterialTheme.typography.bodyMedium,
                    color = KindKartGreenDark,
                    fontWeight = FontWeight.Medium,
                )
            }
        }
    }
}
