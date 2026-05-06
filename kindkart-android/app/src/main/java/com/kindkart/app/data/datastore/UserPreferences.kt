package com.kindkart.app.data.datastore

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.*
import androidx.datastore.preferences.preferencesDataStore
import com.google.gson.Gson
import com.kindkart.app.data.model.User
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import javax.inject.Inject
import javax.inject.Singleton

private val Context.dataStore: DataStore<Preferences> by preferencesDataStore(name = "kindkart_prefs")

@Singleton
class UserPreferences @Inject constructor(
    @ApplicationContext private val context: Context
) {
    private val gson = Gson()

    companion object {
        private val KEY_ACCESS_TOKEN = stringPreferencesKey("access_token")
        private val KEY_REFRESH_TOKEN = stringPreferencesKey("refresh_token")
        private val KEY_USER_JSON = stringPreferencesKey("user_json")
        private val KEY_IS_GUEST = booleanPreferencesKey("is_guest")
        private val KEY_IS_DEMO_MODE = booleanPreferencesKey("is_demo_mode")
        private val KEY_IS_LOGGED_IN = booleanPreferencesKey("is_logged_in")
        private val KEY_USER_ROLE = stringPreferencesKey("user_role")
        private val KEY_KARMA_SCORE = intPreferencesKey("karma_score")
        private val KEY_STREAK_DAYS = intPreferencesKey("streak_days")
    }

    val accessToken: Flow<String?> = context.dataStore.data.map { it[KEY_ACCESS_TOKEN] }
    val refreshToken: Flow<String?> = context.dataStore.data.map { it[KEY_REFRESH_TOKEN] }
    val isGuest: Flow<Boolean> = context.dataStore.data.map { it[KEY_IS_GUEST] ?: false }
    val isDemoMode: Flow<Boolean> = context.dataStore.data.map { it[KEY_IS_DEMO_MODE] ?: false }
    val isLoggedIn: Flow<Boolean> = context.dataStore.data.map { it[KEY_IS_LOGGED_IN] ?: false }
    val userRole: Flow<String> = context.dataStore.data.map { it[KEY_USER_ROLE] ?: "USER" }
    val karmaScore: Flow<Int> = context.dataStore.data.map { it[KEY_KARMA_SCORE] ?: 0 }
    val streakDays: Flow<Int> = context.dataStore.data.map { it[KEY_STREAK_DAYS] ?: 0 }

    val currentUser: Flow<User?> = context.dataStore.data.map { prefs ->
        val json = prefs[KEY_USER_JSON]
        if (json != null) {
            try { gson.fromJson(json, User::class.java) } catch (_: Exception) { null }
        } else null
    }

    suspend fun saveAuthData(user: User, accessToken: String, refreshToken: String?, isGuest: Boolean = false) {
        context.dataStore.edit { prefs ->
            prefs[KEY_ACCESS_TOKEN] = accessToken
            if (refreshToken != null) prefs[KEY_REFRESH_TOKEN] = refreshToken
            prefs[KEY_USER_JSON] = gson.toJson(user)
            prefs[KEY_IS_GUEST] = isGuest
            prefs[KEY_IS_DEMO_MODE] = isGuest
            prefs[KEY_IS_LOGGED_IN] = true
        }
    }

    suspend fun updateUser(user: User) {
        context.dataStore.edit { prefs ->
            prefs[KEY_USER_JSON] = gson.toJson(user)
        }
    }

    suspend fun updateTokens(accessToken: String, refreshToken: String? = null) {
        context.dataStore.edit { prefs ->
            prefs[KEY_ACCESS_TOKEN] = accessToken
            if (refreshToken != null) prefs[KEY_REFRESH_TOKEN] = refreshToken
        }
    }

    suspend fun saveRole(role: String) {
        context.dataStore.edit { prefs ->
            prefs[KEY_USER_ROLE] = role
        }
    }

    suspend fun saveKarmaScore(score: Int) {
        context.dataStore.edit { prefs ->
            prefs[KEY_KARMA_SCORE] = score
        }
    }

    suspend fun saveStreakDays(days: Int) {
        context.dataStore.edit { prefs ->
            prefs[KEY_STREAK_DAYS] = days
        }
    }

    suspend fun clearAll() {
        context.dataStore.edit { it.clear() }
    }
}
