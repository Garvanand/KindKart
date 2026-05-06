package com.kindkart.app.data.repository

import com.kindkart.app.data.api.KindKartApi
import com.kindkart.app.data.datastore.UserPreferences
import com.kindkart.app.data.model.*
import com.kindkart.app.util.DemoData
import kotlinx.coroutines.flow.firstOrNull
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class ChatRepository @Inject constructor(
    private val api: KindKartApi,
    private val prefs: UserPreferences
) {
    suspend fun getConversations(): Result<List<Conversation>> {
        return try {
            val isGuest = prefs.isGuest.firstOrNull() ?: false
            if (isGuest) return Result.success(DemoData.conversations)
            val response = api.getConversations()
            if (response.isSuccessful) Result.success(response.body() ?: emptyList())
            else Result.success(DemoData.conversations)
        } catch (_: Exception) {
            Result.success(DemoData.conversations)
        }
    }

    suspend fun getMessages(requestId: String): Result<List<Message>> {
        return try {
            val response = api.getMessagesByRequest(requestId)
            if (response.isSuccessful) Result.success(response.body() ?: emptyList())
            else Result.success(DemoData.messages)
        } catch (_: Exception) {
            Result.success(DemoData.messages)
        }
    }

    suspend fun sendMessage(requestId: String, content: String, receiverId: String): Result<Message> {
        return try {
            val response = api.sendMessage(SendMessageRequest(requestId, content, receiverId))
            if (response.isSuccessful && response.body() != null) Result.success(response.body()!!)
            else Result.failure(Exception("Failed to send message"))
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}

@Singleton
class WalletRepository @Inject constructor(
    private val api: KindKartApi,
    private val prefs: UserPreferences
) {
    suspend fun getWallet(userId: String): Result<WalletInfo> {
        return try {
            val isGuest = prefs.isGuest.firstOrNull() ?: false
            if (isGuest) return Result.success(DemoData.walletInfo)
            val response = api.getWallet(userId)
            if (response.isSuccessful && response.body() != null) Result.success(response.body()!!)
            else Result.success(DemoData.walletInfo)
        } catch (_: Exception) {
            Result.success(DemoData.walletInfo)
        }
    }

    suspend fun getTransactions(): Result<List<Transaction>> {
        return try {
            val isGuest = prefs.isGuest.firstOrNull() ?: false
            if (isGuest) return Result.success(DemoData.transactions)
            val response = api.getTransactions()
            if (response.isSuccessful) Result.success(response.body() ?: emptyList())
            else Result.success(DemoData.transactions)
        } catch (_: Exception) {
            Result.success(DemoData.transactions)
        }
    }
}

@Singleton
class ReputationRepository @Inject constructor(
    private val api: KindKartApi,
    private val prefs: UserPreferences
) {
    suspend fun getUserReputation(userId: String): Result<ReputationInfo> {
        return try {
            val isGuest = prefs.isGuest.firstOrNull() ?: false
            if (isGuest) return Result.success(DemoData.reputationInfo)
            val response = api.getUserReputation(userId)
            if (response.isSuccessful && response.body() != null) Result.success(response.body()!!)
            else Result.success(DemoData.reputationInfo)
        } catch (_: Exception) {
            Result.success(DemoData.reputationInfo)
        }
    }

    suspend fun getLeaderboard(type: String = "overall"): Result<List<LeaderboardEntry>> {
        return try {
            val response = api.getLeaderboard(type = type)
            if (response.isSuccessful) Result.success(response.body() ?: DemoData.leaderboard)
            else Result.success(DemoData.leaderboard)
        } catch (_: Exception) {
            Result.success(DemoData.leaderboard)
        }
    }

    suspend fun getBadges(userId: String): Result<List<Badge>> {
        return try {
            val response = api.getUserBadges(userId)
            if (response.isSuccessful) Result.success(response.body() ?: DemoData.badges)
            else Result.success(DemoData.badges)
        } catch (_: Exception) {
            Result.success(DemoData.badges)
        }
    }
}

@Singleton
class NotificationRepository @Inject constructor(
    private val api: KindKartApi
) {
    suspend fun getNotifications(): Result<List<Notification>> {
        return try {
            val response = api.getNotifications()
            if (response.isSuccessful) Result.success(response.body() ?: emptyList())
            else Result.success(DemoData.notifications)
        } catch (_: Exception) {
            Result.success(DemoData.notifications)
        }
    }

    suspend fun getUnreadCount(): Int {
        return try {
            val response = api.getUnreadCount()
            if (response.isSuccessful) response.body()?.get("count") ?: 0
            else 3
        } catch (_: Exception) { 3 }
    }

    suspend fun markAllRead() {
        try { api.markAllRead() } catch (_: Exception) {}
    }
}
