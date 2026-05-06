package com.kindkart.app.ui.screens.auth

import androidx.compose.animation.*
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import com.kindkart.app.ui.theme.*

@Composable
fun AuthScreen(
    onAuthSuccess: () -> Unit,
    viewModel: AuthViewModel = hiltViewModel(),
) {
    val uiState by viewModel.uiState.collectAsState()

    LaunchedEffect(uiState.authSuccess) {
        if (uiState.authSuccess) onAuthSuccess()
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(SurfaceBackground)
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .verticalScroll(rememberScrollState())
                .padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
        ) {
            Spacer(Modifier.height(48.dp))

            // Logo
            Box(
                modifier = Modifier
                    .size(56.dp)
                    .background(
                        Brush.linearGradient(listOf(KindKartGreen, KindKartGreenLight)),
                        shape = RoundedCornerShape(16.dp)
                    ),
                contentAlignment = Alignment.Center,
            ) {
                Icon(Icons.Default.Favorite, contentDescription = null, tint = TextOnPrimary, modifier = Modifier.size(28.dp))
            }

            Spacer(Modifier.height(16.dp))
            Text("KindKart", style = MaterialTheme.typography.headlineLarge, color = TextPrimary, fontWeight = FontWeight.Bold)
            Spacer(Modifier.height(4.dp))
            Text("Neighborhood OS", style = MaterialTheme.typography.bodyMedium, color = TextSecondary)

            Spacer(Modifier.height(32.dp))

            // Step indicator
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically,
            ) {
                StepIndicator(step = 1, label = "Sign In", isActive = uiState.step == AuthStep.LOGIN)
                Box(modifier = Modifier.weight(1f).height(1.dp).background(SurfaceCardBorder))
                StepIndicator(step = 2, label = "Profile", isActive = uiState.step == AuthStep.PROFILE)
            }

            Spacer(Modifier.height(24.dp))

            // Form Card
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(24.dp),
                colors = CardDefaults.cardColors(containerColor = SurfaceCard),
                border = CardDefaults.outlinedCardBorder().let {
                    androidx.compose.foundation.BorderStroke(1.dp, SurfaceCardBorder)
                },
                elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
            ) {
                AnimatedContent(
                    targetState = uiState.step,
                    transitionSpec = {
                        slideInHorizontally { it / 2 } + fadeIn() togetherWith slideOutHorizontally { -it / 2 } + fadeOut()
                    },
                    label = "auth_step"
                ) { step ->
                    when (step) {
                        AuthStep.LOGIN -> LoginContent(
                            email = uiState.email,
                            otp = uiState.otp,
                            otpSent = uiState.otpSent,
                            isLoading = uiState.isLoading,
                            error = uiState.error,
                            onEmailChange = viewModel::onEmailChange,
                            onOtpChange = viewModel::onOtpChange,
                            onSendOtp = viewModel::sendOtp,
                            onVerifyOtp = viewModel::verifyOtp,
                            onGuestLogin = viewModel::guestLogin,
                        )
                        AuthStep.PROFILE -> ProfileSetupContent(
                            name = uiState.profileName,
                            isLoading = uiState.isLoading,
                            error = uiState.error,
                            onNameChange = viewModel::onProfileNameChange,
                            onComplete = viewModel::completeProfile,
                            onSkip = { viewModel.skipProfile() },
                        )
                    }
                }
            }

            Spacer(Modifier.height(16.dp))
            Text(
                "By continuing, you agree to our Terms of Service and Privacy Policy",
                style = MaterialTheme.typography.labelSmall,
                color = TextSecondary.copy(alpha = 0.5f),
                textAlign = TextAlign.Center,
            )

            Spacer(Modifier.height(48.dp))

            // Features
            Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                FeatureItem(Icons.Outlined.Shield, "Trust-based reputation system")
                FeatureItem(Icons.Outlined.People, "Verified community members")
                FeatureItem(Icons.Outlined.Bolt, "Instant help matching")
            }

            Spacer(Modifier.height(24.dp))
        }
    }
}

@Composable
private fun LoginContent(
    email: String,
    otp: String,
    otpSent: Boolean,
    isLoading: Boolean,
    error: String?,
    onEmailChange: (String) -> Unit,
    onOtpChange: (String) -> Unit,
    onSendOtp: () -> Unit,
    onVerifyOtp: () -> Unit,
    onGuestLogin: () -> Unit,
) {
    Column(modifier = Modifier.padding(24.dp)) {
        Text("Welcome back", style = MaterialTheme.typography.headlineMedium, color = TextPrimary, fontWeight = FontWeight.Bold)
        Spacer(Modifier.height(4.dp))
        Text("Sign in to your neighborhood", style = MaterialTheme.typography.bodyMedium, color = TextSecondary)
        Spacer(Modifier.height(24.dp))

        if (error != null) {
            Card(
                colors = CardDefaults.cardColors(containerColor = ErrorRed.copy(alpha = 0.1f)),
                shape = RoundedCornerShape(12.dp),
                modifier = Modifier.fillMaxWidth(),
            ) {
                Text(error, color = ErrorRed, style = MaterialTheme.typography.bodySmall, modifier = Modifier.padding(12.dp))
            }
            Spacer(Modifier.height(12.dp))
        }

        OutlinedTextField(
            value = email,
            onValueChange = onEmailChange,
            label = { Text("Email address") },
            placeholder = { Text("you@example.com") },
            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email, imeAction = ImeAction.Done),
            keyboardActions = KeyboardActions(onDone = { if (!otpSent) onSendOtp() }),
            singleLine = true,
            shape = RoundedCornerShape(16.dp),
            modifier = Modifier.fillMaxWidth(),
            colors = OutlinedTextFieldDefaults.colors(
                focusedBorderColor = KindKartGreen,
                unfocusedBorderColor = SurfaceCardBorder,
            ),
        )

        if (otpSent) {
            Spacer(Modifier.height(12.dp))
            OutlinedTextField(
                value = otp,
                onValueChange = onOtpChange,
                label = { Text("Enter OTP") },
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number, imeAction = ImeAction.Done),
                keyboardActions = KeyboardActions(onDone = { onVerifyOtp() }),
                singleLine = true,
                shape = RoundedCornerShape(16.dp),
                modifier = Modifier.fillMaxWidth(),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = KindKartGreen,
                    unfocusedBorderColor = SurfaceCardBorder,
                ),
            )
        }

        Spacer(Modifier.height(20.dp))

        Button(
            onClick = { if (otpSent) onVerifyOtp() else onSendOtp() },
            modifier = Modifier.fillMaxWidth().height(52.dp),
            shape = RoundedCornerShape(24.dp),
            colors = ButtonDefaults.buttonColors(containerColor = KindKartGreen),
            enabled = !isLoading,
        ) {
            if (isLoading) CircularProgressIndicator(modifier = Modifier.size(20.dp), color = TextOnPrimary, strokeWidth = 2.dp)
            else Text(if (otpSent) "Verify OTP" else "Send OTP", fontWeight = FontWeight.SemiBold, fontSize = 16.sp)
        }

        Spacer(Modifier.height(12.dp))

        // Divider
        Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.fillMaxWidth()) {
            HorizontalDivider(modifier = Modifier.weight(1f), color = SurfaceCardBorder)
            Text("  or  ", style = MaterialTheme.typography.bodySmall, color = TextSecondary)
            HorizontalDivider(modifier = Modifier.weight(1f), color = SurfaceCardBorder)
        }

        Spacer(Modifier.height(12.dp))

        OutlinedButton(
            onClick = onGuestLogin,
            modifier = Modifier.fillMaxWidth().height(48.dp),
            shape = RoundedCornerShape(24.dp),
            border = ButtonDefaults.outlinedButtonBorder,
        ) {
            Icon(Icons.Outlined.Visibility, contentDescription = null, modifier = Modifier.size(18.dp))
            Spacer(Modifier.width(8.dp))
            Text("Try Demo Mode", fontWeight = FontWeight.SemiBold)
        }
    }
}

@Composable
private fun ProfileSetupContent(
    name: String,
    isLoading: Boolean,
    error: String?,
    onNameChange: (String) -> Unit,
    onComplete: () -> Unit,
    onSkip: () -> Unit,
) {
    Column(modifier = Modifier.padding(24.dp)) {
        Text("Complete your profile", style = MaterialTheme.typography.headlineMedium, color = TextPrimary, fontWeight = FontWeight.Bold)
        Spacer(Modifier.height(4.dp))
        Text("Help your neighbors know you", style = MaterialTheme.typography.bodyMedium, color = TextSecondary)
        Spacer(Modifier.height(24.dp))

        if (error != null) {
            Card(
                colors = CardDefaults.cardColors(containerColor = ErrorRed.copy(alpha = 0.1f)),
                shape = RoundedCornerShape(12.dp), modifier = Modifier.fillMaxWidth(),
            ) {
                Text(error, color = ErrorRed, style = MaterialTheme.typography.bodySmall, modifier = Modifier.padding(12.dp))
            }
            Spacer(Modifier.height(12.dp))
        }

        OutlinedTextField(
            value = name,
            onValueChange = onNameChange,
            label = { Text("Your name") },
            singleLine = true,
            shape = RoundedCornerShape(16.dp),
            modifier = Modifier.fillMaxWidth(),
            colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = KindKartGreen, unfocusedBorderColor = SurfaceCardBorder),
        )

        Spacer(Modifier.height(24.dp))

        Button(
            onClick = onComplete,
            modifier = Modifier.fillMaxWidth().height(52.dp),
            shape = RoundedCornerShape(24.dp),
            colors = ButtonDefaults.buttonColors(containerColor = KindKartGreen),
            enabled = !isLoading && name.isNotBlank(),
        ) {
            if (isLoading) CircularProgressIndicator(modifier = Modifier.size(20.dp), color = TextOnPrimary, strokeWidth = 2.dp)
            else Text("Continue", fontWeight = FontWeight.SemiBold, fontSize = 16.sp)
        }

        Spacer(Modifier.height(8.dp))
        TextButton(onClick = onSkip, modifier = Modifier.fillMaxWidth()) {
            Text("Skip for now", color = TextSecondary)
        }
    }
}

@Composable
private fun StepIndicator(step: Int, label: String, isActive: Boolean) {
    Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.padding(horizontal = 4.dp)) {
        Box(
            modifier = Modifier
                .size(32.dp)
                .clip(RoundedCornerShape(8.dp))
                .background(if (isActive) KindKartGreen else SurfaceMuted),
            contentAlignment = Alignment.Center,
        ) {
            Text("$step", color = if (isActive) TextOnPrimary else TextSecondary, fontWeight = FontWeight.Bold, fontSize = 13.sp)
        }
        Spacer(Modifier.width(8.dp))
        Text(label, style = MaterialTheme.typography.labelLarge, color = if (isActive) TextPrimary else TextSecondary)
    }
}

@Composable
private fun FeatureItem(icon: androidx.compose.ui.graphics.vector.ImageVector, label: String) {
    Row(verticalAlignment = Alignment.CenterVertically) {
        Box(
            modifier = Modifier.size(36.dp).clip(RoundedCornerShape(8.dp)).background(KindKartGreen.copy(alpha = 0.1f)),
            contentAlignment = Alignment.Center,
        ) {
            Icon(icon, contentDescription = null, tint = KindKartGreen, modifier = Modifier.size(18.dp))
        }
        Spacer(Modifier.width(12.dp))
        Text(label, style = MaterialTheme.typography.bodySmall, color = TextSecondary)
    }
}
