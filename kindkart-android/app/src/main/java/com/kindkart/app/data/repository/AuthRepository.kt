package com.kindkart.app.data.repository

import com.kindkart.app.data.api.KindKartApi
import com.kindkart.app.data.datastore.UserPreferences
import com.kindkart.app.data.model.*
import com.kindkart.app.util.DemoData
import kotlinx.coroutines.flow.firstOrNull
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class AuthRepository @Inject constructor(
    private val api: KindKartApi,
    private val prefs: UserPreferences
) {
    suspend fun sendOtp(email: String? = null, phone: String? = null): Result<Map<String, Any>> {
        return try {
            val response = api.sendOtp(OtpRequest(email = email, phone = phone))
            if (response.isSuccessful) Result.success(response.body() ?: emptyMap())
            else Result.failure(Exception("Failed to send OTP"))
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun verifyOtp(email: String?, phone: String?, otp: String, name: String? = null): Result<AuthResponse> {
        return try {
            val response = api.verifyOtp(OtpVerifyRequest(email = email, phone = phone, otp = otp, name = name))
            if (response.isSuccessful && response.body() != null) {
                val auth = response.body()!!
                prefs.saveAuthData(auth.user, auth.accessToken, auth.refreshToken, isGuest = false)
                Result.success(auth)
            } else Result.failure(Exception("OTP verification failed"))
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun guestLogin(): Result<User> {
        val guestId = "guest_${(1000..9999).random()}"
        val guestUser = DemoData.createGuestUser(guestId)
        val token = "guest_token_$guestId"
        prefs.saveAuthData(guestUser, token, null, isGuest = true)
        return Result.success(guestUser)
    }

    suspend fun logout() {
        try { api.logout() } catch (_: Exception) {}
        prefs.clearAll()
    }

    suspend fun isLoggedIn(): Boolean = prefs.isLoggedIn.firstOrNull() ?: false
    suspend fun getCurrentUser(): User? = prefs.currentUser.firstOrNull()
    suspend fun isGuest(): Boolean = prefs.isGuest.firstOrNull() ?: false
}
