package com.kindkart.app.data.model

import com.google.gson.annotations.SerializedName

// ===== User =====
data class User(
    val id: String = "",
    val email: String = "",
    val phone: String = "",
    val name: String = "",
    val isVerified: Boolean = false,
    val isGuest: Boolean = false,
    val guestId: String? = null,
    val avatar: String? = null,
    val rank: String? = null,
    val xp: Int = 0,
    val level: Int = 1,
    val trustScore: Int = 0,
    val age: Int? = null,
    val qualification: String? = null,
    val certifications: List<String> = emptyList(),
    val profilePhoto: String? = null,
    val availability: String = "available"
)

// ===== Auth =====
data class AuthResponse(
    val user: User,
    val accessToken: String,
    val refreshToken: String? = null
)

data class OtpRequest(
    val email: String? = null,
    val phone: String? = null
)

data class OtpVerifyRequest(
    val email: String? = null,
    val phone: String? = null,
    val otp: String,
    val name: String? = null,
    val age: Int? = null,
    val qualification: String? = null,
    val certifications: List<String>? = null
)

data class RefreshTokenRequest(val refreshToken: String)

data class ProfileUpdateRequest(
    val name: String? = null,
    val age: Int? = null,
    val qualification: String? = null,
    val certifications: List<String>? = null
)

data class ProfileUpdateResponse(val user: User)

// ===== Community =====
data class Community(
    val id: String = "",
    val name: String = "",
    val inviteCode: String = "",
    val adminId: String = "",
    val rules: String? = null,
    val settings: String? = null,
    val createdAt: String? = null
)

data class CommunityMembership(
    val id: String = "",
    val role: String = "member",
    val status: String = "pending",
    val joinedAt: String? = null,
    val community: Community = Community()
)

data class CommunityCreateRequest(
    val name: String,
    val rules: String? = null
)

data class CommunityJoinRequest(val inviteCode: String)

data class CommunityMember(
    val id: String = "",
    val userId: String = "",
    val role: String = "member",
    val status: String = "pending",
    val user: User? = null
)

// ===== Help Request =====
data class HelpRequest(
    val id: String = "",
    val requesterId: String = "",
    val communityId: String = "",
    val title: String = "",
    val description: String = "",
    val category: String = "",
    val status: String = "pending",
    val helperId: String? = null,
    val location: String? = null,
    val timing: String? = null,
    val privacyLevel: String = "community",
    val createdAt: String? = null,
    val updatedAt: String? = null,
    val requester: User? = null
)

data class HelpRequestCreate(
    val title: String,
    val description: String,
    val category: String,
    val communityId: String,
    val location: String? = null,
    val timing: String? = null,
    val privacyLevel: String = "community"
)

data class RequestResponse(
    val id: String = "",
    val requestId: String = "",
    val helperId: String = "",
    val message: String = "",
    val status: String = "pending",
    val createdAt: String? = null,
    val helper: User? = null
)

// ===== Messages =====
data class Message(
    val id: String = "",
    val senderId: String = "",
    val receiverId: String = "",
    val requestId: String = "",
    val content: String = "",
    val messageType: String = "text",
    val createdAt: String? = null,
    val sender: User? = null
)

data class SendMessageRequest(
    val requestId: String,
    val content: String,
    val receiverId: String
)

data class Conversation(
    val requestId: String = "",
    val otherUser: User? = null,
    val lastMessage: Message? = null,
    val unreadCount: Int = 0
)

// ===== Payments =====
data class WalletInfo(
    val balance: Double = 0.0,
    val totalEarned: Double = 0.0,
    val totalSpent: Double = 0.0,
    val pendingAmount: Double = 0.0
)

data class Transaction(
    val id: String = "",
    val requestId: String = "",
    val payerId: String = "",
    val payeeId: String = "",
    val amount: Double = 0.0,
    val status: String = "pending",
    val createdAt: String? = null,
    val completedAt: String? = null
)

data class PaymentOrderRequest(
    val requestId: String,
    val amount: Double,
    val currency: String = "INR",
    val helperId: String
)

// ===== Reputation =====
data class ReputationInfo(
    val userId: String = "",
    val totalPoints: Int = 0,
    val helperScore: Int = 0,
    val requesterScore: Int = 0,
    val badges: List<Badge> = emptyList(),
    val rank: Int? = null
)

data class Badge(
    val id: String = "",
    val type: String = "",
    val name: String = "",
    val description: String = "",
    val icon: String = "",
    val earnedAt: String? = null
)

data class LeaderboardEntry(
    val userId: String = "",
    val name: String = "",
    val totalPoints: Int = 0,
    val rank: Int = 0,
    val avatar: String? = null
)

// ===== Notifications =====
data class Notification(
    val id: String = "",
    val userId: String = "",
    val type: String = "",
    val title: String = "",
    val message: String = "",
    val isRead: Boolean = false,
    val createdAt: String? = null
)

// ===== Emergency =====
data class EmergencyAlert(
    val id: String = "",
    val userId: String = "",
    val communityId: String = "",
    val type: String = "general",
    val title: String = "",
    val description: String? = null,
    val status: String = "active",
    val location: String? = null,
    val createdAt: String? = null
)

// ===== Tasks =====
data class CommunityTask(
    val id: String = "",
    val communityId: String = "",
    val creatorId: String = "",
    val title: String = "",
    val description: String = "",
    val category: String = "",
    val status: String = "open",
    val priority: String = "medium",
    val payment: Double = 0.0,
    val maxParticipants: Int = 1,
    val scheduledDate: String? = null,
    val createdAt: String? = null
)

// ===== Events =====
data class CommunityEvent(
    val id: String = "",
    val communityId: String = "",
    val title: String = "",
    val description: String? = null,
    val eventDate: String = "",
    val eventTime: String? = null,
    val location: String? = null,
    val maxAttendees: Int? = null,
    val status: String = "upcoming",
    val attendeeCount: Int = 0,
    val createdAt: String? = null
)

// ===== Generic API response =====
data class ApiError(
    val error: String = "Unknown error",
    val path: String? = null,
    val timestamp: String? = null
)

// ===== Help Categories =====
data class HelpCategory(
    val id: String,
    val name: String,
    val description: String,
    val icon: String,
    val color: Long
)
