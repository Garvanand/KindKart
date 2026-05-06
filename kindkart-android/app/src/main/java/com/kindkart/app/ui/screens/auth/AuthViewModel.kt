package com.kindkart.app.ui.screens.auth

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.kindkart.app.data.repository.AuthRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

enum class AuthStep { LOGIN, PROFILE }

data class AuthUiState(
    val step: AuthStep = AuthStep.LOGIN,
    val email: String = "",
    val otp: String = "",
    val otpSent: Boolean = false,
    val profileName: String = "",
    val isLoading: Boolean = false,
    val error: String? = null,
    val authSuccess: Boolean = false,
)

@HiltViewModel
class AuthViewModel @Inject constructor(
    private val authRepository: AuthRepository,
) : ViewModel() {

    private val _uiState = MutableStateFlow(AuthUiState())
    val uiState = _uiState.asStateFlow()

    fun onEmailChange(value: String) { _uiState.update { it.copy(email = value, error = null) } }
    fun onOtpChange(value: String) { _uiState.update { it.copy(otp = value, error = null) } }
    fun onProfileNameChange(value: String) { _uiState.update { it.copy(profileName = value, error = null) } }

    fun sendOtp() {
        val email = _uiState.value.email.trim()
        if (email.isBlank() || !email.contains("@")) {
            _uiState.update { it.copy(error = "Please enter a valid email address") }
            return
        }
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true, error = null) }
            val result = authRepository.sendOtp(email = email)
            _uiState.update {
                if (result.isSuccess) it.copy(isLoading = false, otpSent = true)
                else it.copy(isLoading = false, error = result.exceptionOrNull()?.message ?: "Failed to send OTP. Try demo mode.")
            }
        }
    }

    fun verifyOtp() {
        val otp = _uiState.value.otp.trim()
        if (otp.length < 4) {
            _uiState.update { it.copy(error = "Please enter a valid OTP") }
            return
        }
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true, error = null) }
            val result = authRepository.verifyOtp(email = _uiState.value.email, phone = null, otp = otp)
            _uiState.update {
                if (result.isSuccess) it.copy(isLoading = false, step = AuthStep.PROFILE)
                else it.copy(isLoading = false, error = result.exceptionOrNull()?.message ?: "Invalid OTP. Try demo mode.")
            }
        }
    }

    fun guestLogin() {
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true, error = null) }
            val result = authRepository.guestLogin()
            _uiState.update {
                if (result.isSuccess) it.copy(isLoading = false, authSuccess = true)
                else it.copy(isLoading = false, error = "Guest login failed")
            }
        }
    }

    fun completeProfile() {
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true, error = null) }
            // In demo mode, just navigate
            _uiState.update { it.copy(isLoading = false, authSuccess = true) }
        }
    }

    fun skipProfile() {
        _uiState.update { it.copy(authSuccess = true) }
    }
}
