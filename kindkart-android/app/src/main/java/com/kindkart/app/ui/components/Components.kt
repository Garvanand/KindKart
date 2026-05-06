package com.kindkart.app.ui.components

import androidx.compose.animation.core.*
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.SearchOff
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.graphics.graphicsLayer
import com.kindkart.app.ui.theme.*

// ===== PremiumCard =====
@Composable
fun PremiumCard(
    modifier: Modifier = Modifier,
    interactive: Boolean = false,
    onClick: (() -> Unit)? = null,
    content: @Composable ColumnScope.() -> Unit
) {
    val shape = RoundedCornerShape(16.dp)

    // Entrance animation
    var visible by remember { mutableStateOf(false) }
    LaunchedEffect(Unit) { visible = true }
    
    val alpha by animateFloatAsState(
        targetValue = if (visible) 1f else 0f,
        animationSpec = tween(400),
        label = "cardAlpha"
    )
    val translationY by animateFloatAsState(
        targetValue = if (visible) 0f else 20f,
        animationSpec = spring(stiffness = 300f, dampingRatio = 0.8f),
        label = "cardTranslation"
    )

    Card(
        modifier = modifier
            .fillMaxWidth()
            .graphicsLayer(alpha = alpha, translationY = translationY)
            .then(
                if (interactive && onClick != null) Modifier.clickable(
                    interactionSource = remember { MutableInteractionSource() },
                    indication = ripple(bounded = true),
                    onClick = onClick
                ) else Modifier
            ),
        shape = shape,
        colors = CardDefaults.cardColors(
            containerColor = SurfaceCard,
        ),
        border = CardDefaults.outlinedCardBorder().let {
            androidx.compose.foundation.BorderStroke(1.dp, SurfaceCardBorder)
        },
        elevation = CardDefaults.cardElevation(
            defaultElevation = if (interactive) 2.dp else 0.dp,
            pressedElevation = 1.dp,
        ),
        content = content,
    )
}

// ===== KindKartBadge =====
enum class BadgeVariant { SUCCESS, WARNING, ERROR, GHOST, INFO }

@Composable
fun KindKartBadge(
    text: String,
    variant: BadgeVariant = BadgeVariant.GHOST,
    modifier: Modifier = Modifier,
) {
    val (bgColor, textColor) = when (variant) {
        BadgeVariant.SUCCESS -> BadgeSuccessBg to BadgeSuccessText
        BadgeVariant.WARNING -> BadgeWarningBg to BadgeWarningText
        BadgeVariant.ERROR -> BadgeErrorBg to BadgeErrorText
        BadgeVariant.INFO -> Color(0x260EA5E9) to InfoBlue
        BadgeVariant.GHOST -> BadgeGhostBg to BadgeGhostText
    }
    Box(
        modifier = modifier
            .clip(RoundedCornerShape(20.dp))
            .background(bgColor)
            .padding(horizontal = 10.dp, vertical = 4.dp)
    ) {
        Text(
            text = text,
            color = textColor,
            fontSize = 11.sp,
            fontWeight = FontWeight.Bold,
            letterSpacing = 0.3.sp,
        )
    }
}

// ===== Shimmer Loading =====
@Composable
fun ShimmerBox(
    modifier: Modifier = Modifier,
    height: Dp = 16.dp,
    widthFraction: Float = 1f,
) {
    val shimmerColors = listOf(
        SurfaceMuted,
        SurfaceMuted.copy(alpha = 0.5f),
        SurfaceMuted,
    )
    val transition = rememberInfiniteTransition(label = "shimmer")
    val translateAnim by transition.animateFloat(
        initialValue = 0f,
        targetValue = 1000f,
        animationSpec = infiniteRepeatable(
            animation = tween(1200, easing = LinearEasing),
            repeatMode = RepeatMode.Restart
        ),
        label = "shimmer_translate"
    )
    val brush = Brush.linearGradient(
        colors = shimmerColors,
        start = Offset(translateAnim - 200f, 0f),
        end = Offset(translateAnim, 0f),
    )
    Box(
        modifier = modifier
            .fillMaxWidth(widthFraction)
            .height(height)
            .clip(RoundedCornerShape(8.dp))
            .background(brush)
    )
}

@Composable
fun ShimmerCard(modifier: Modifier = Modifier) {
    PremiumCard(modifier = modifier) {
        Column(modifier = Modifier.padding(16.dp)) {
            ShimmerBox(height = 20.dp, widthFraction = 0.6f)
            Spacer(Modifier.height(12.dp))
            ShimmerBox(height = 14.dp, widthFraction = 1f)
            Spacer(Modifier.height(8.dp))
            ShimmerBox(height = 14.dp, widthFraction = 0.8f)
        }
    }
}

// ===== AnimatedEmptyState =====
@Composable
fun AnimatedEmptyState(
    icon: ImageVector = Icons.Outlined.SearchOff,
    title: String,
    description: String,
    actionLabel: String? = null,
    onAction: (() -> Unit)? = null,
    modifier: Modifier = Modifier,
) {
    var visible by remember { mutableStateOf(false) }
    LaunchedEffect(Unit) { visible = true }

    val iconScale by animateFloatAsState(
        targetValue = if (visible) 1f else 0.5f,
        animationSpec = spring(dampingRatio = 0.5f, stiffness = 200f),
        label = "emptyIconScale"
    )
    val contentAlpha by animateFloatAsState(
        targetValue = if (visible) 1f else 0f,
        animationSpec = tween(500, delayMillis = 100),
        label = "emptyContentAlpha"
    )

    Column(
        modifier = modifier
            .fillMaxWidth()
            .padding(32.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        Icon(
            imageVector = icon,
            contentDescription = null,
            modifier = Modifier.size(64.dp).graphicsLayer(scaleX = iconScale, scaleY = iconScale),
            tint = KindKartGreen.copy(alpha = 0.5f),
        )
        Spacer(Modifier.height(16.dp))
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            modifier = Modifier.graphicsLayer(alpha = contentAlpha)
        ) {
            Text(
                text = title,
                style = MaterialTheme.typography.titleMedium,
                color = TextPrimary,
                textAlign = TextAlign.Center,
                fontWeight = FontWeight.SemiBold,
            )
            Spacer(Modifier.height(6.dp))
            Text(
                text = description,
                style = MaterialTheme.typography.bodySmall,
                color = TextSecondary,
                textAlign = TextAlign.Center,
            )
            if (actionLabel != null && onAction != null) {
                Spacer(Modifier.height(24.dp))
                AnimatedScaleButton(
                    onClick = onAction,
                    withHaptic = true,
                ) {
                    Text(actionLabel, fontWeight = FontWeight.SemiBold, modifier = Modifier.padding(horizontal = 8.dp))
                }
            }
        }
    }
}

// ===== EmptyState =====
@Composable
fun EmptyState(
    icon: ImageVector = Icons.Outlined.SearchOff,
    title: String,
    description: String,
    actionLabel: String? = null,
    onAction: (() -> Unit)? = null,
    modifier: Modifier = Modifier,
) {
    Column(
        modifier = modifier
            .fillMaxWidth()
            .padding(32.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        Icon(
            imageVector = icon,
            contentDescription = null,
            modifier = Modifier.size(56.dp),
            tint = TextSecondary.copy(alpha = 0.4f),
        )
        Spacer(Modifier.height(16.dp))
        Text(
            text = title,
            style = MaterialTheme.typography.titleMedium,
            color = TextPrimary,
            textAlign = TextAlign.Center,
        )
        Spacer(Modifier.height(4.dp))
        Text(
            text = description,
            style = MaterialTheme.typography.bodySmall,
            color = TextSecondary,
            textAlign = TextAlign.Center,
        )
        if (actionLabel != null && onAction != null) {
            Spacer(Modifier.height(20.dp))
            Button(
                onClick = onAction,
                shape = RoundedCornerShape(24.dp),
                colors = ButtonDefaults.buttonColors(containerColor = KindKartGreen),
            ) {
                Text(actionLabel, fontWeight = FontWeight.SemiBold)
            }
        }
    }
}

// ===== ErrorState =====
@Composable
fun ErrorState(
    message: String,
    onRetry: (() -> Unit)? = null,
    modifier: Modifier = Modifier,
) {
    PremiumCard(modifier = modifier) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
        ) {
            Text(
                text = message,
                style = MaterialTheme.typography.bodySmall,
                color = ErrorRed,
                textAlign = TextAlign.Center,
            )
            if (onRetry != null) {
                Spacer(Modifier.height(12.dp))
                OutlinedButton(
                    onClick = onRetry,
                    shape = RoundedCornerShape(24.dp),
                ) {
                    Text("Retry", fontWeight = FontWeight.SemiBold)
                }
            }
        }
    }
}

// ===== StatCard =====
@Composable
fun StatCard(
    label: String,
    value: String,
    modifier: Modifier = Modifier,
) {
    Column(modifier = modifier) {
        Text(
            text = value,
            style = MaterialTheme.typography.headlineMedium,
            color = TextPrimary,
            fontWeight = FontWeight.Bold,
        )
        Spacer(Modifier.height(2.dp))
        Text(
            text = label,
            style = MaterialTheme.typography.bodySmall,
            color = TextSecondary,
        )
    }
}

// ===== UserAvatar =====
@Composable
fun UserAvatar(
    name: String,
    size: Dp = 40.dp,
    modifier: Modifier = Modifier,
) {
    Box(
        modifier = modifier
            .size(size)
            .clip(CircleShape)
            .background(ActiveNavBg),
        contentAlignment = Alignment.Center,
    ) {
        Text(
            text = name.take(1).uppercase(),
            fontWeight = FontWeight.SemiBold,
            color = KindKartGreenDark,
            fontSize = (size.value * 0.4f).sp,
        )
    }
}

// ===== SectionHeader =====
@Composable
fun SectionHeader(
    title: String,
    action: String? = null,
    onAction: (() -> Unit)? = null,
    modifier: Modifier = Modifier,
) {
    Row(
        modifier = modifier
            .fillMaxWidth()
            .padding(horizontal = 4.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Text(
            text = title,
            style = MaterialTheme.typography.titleSmall,
            color = TextPrimary,
        )
        if (action != null && onAction != null) {
            TextButton(onClick = onAction) {
                Text(
                    text = action,
                    style = MaterialTheme.typography.labelMedium,
                    color = KindKartGreen,
                )
            }
        }
    }
}
