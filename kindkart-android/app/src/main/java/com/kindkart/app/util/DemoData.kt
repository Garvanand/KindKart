package com.kindkart.app.util

import com.kindkart.app.data.model.*

object DemoData {

    fun createGuestUser(guestId: String): User {
        val names = listOf("Helpful Neighbor", "Community Hero", "Kind Helper", "Local Guide", "Friendly Face")
        val name = names.random()
        val num = guestId.substringAfter("_")
        return User(
            id = guestId,
            email = "",
            phone = "",
            name = "$name #$num",
            isVerified = false,
            isGuest = true,
            guestId = guestId,
            rank = "Visitor",
            xp = 0,
            level = 1,
            trustScore = 0,
            availability = "available"
        )
    }

    val communities = listOf(
        CommunityMembership(
            id = "cm1", role = "admin", status = "approved", joinedAt = "2026-01-15",
            community = Community(id = "c1", name = "Green Valley Society", inviteCode = "GV2026", adminId = "u1")
        ),
        CommunityMembership(
            id = "cm2", role = "member", status = "approved", joinedAt = "2026-02-01",
            community = Community(id = "c2", name = "Sunrise Apartments", inviteCode = "SA2026", adminId = "u2")
        ),
        CommunityMembership(
            id = "cm3", role = "member", status = "approved", joinedAt = "2026-02-20",
            community = Community(id = "c3", name = "VIT Campus Network", inviteCode = "VIT26", adminId = "u3")
        ),
    )

    val helpRequests = listOf(
        HelpRequest(
            id = "r1", requesterId = "u1", communityId = "c1",
            title = "Need help with grocery pickup",
            description = "I have a sprained ankle and can't go to the store. Could someone pick up a few essentials from D-Mart?",
            category = "groceries", status = "pending", createdAt = "2026-03-28T10:30:00Z",
            requester = User(id = "u1", name = "Ananya Sharma")
        ),
        HelpRequest(
            id = "r2", requesterId = "u2", communityId = "c1",
            title = "Plumbing issue — kitchen tap leaking",
            description = "The kitchen tap has been leaking since yesterday. Looking for someone who can fix it or recommend a plumber.",
            category = "repairs", status = "accepted", createdAt = "2026-03-27T14:15:00Z",
            requester = User(id = "u2", name = "Rahul Menon")
        ),
        HelpRequest(
            id = "r3", requesterId = "u3", communityId = "c2",
            title = "Dog walker needed for this weekend",
            description = "Going out of town this Saturday. Need someone to walk my Golden Retriever twice — morning and evening.",
            category = "petcare", status = "pending", createdAt = "2026-03-26T09:00:00Z",
            requester = User(id = "u3", name = "Priya Nair")
        ),
        HelpRequest(
            id = "r4", requesterId = "u4", communityId = "c2",
            title = "Ride to VIT campus (Monday 8 AM)",
            description = "I have an early exam on Monday. Looking for a carpool from Sunrise Apartments to VIT main campus.",
            category = "transportation", status = "completed", createdAt = "2026-03-25T18:30:00Z",
            requester = User(id = "u4", name = "Karthik Iyer")
        ),
        HelpRequest(
            id = "r5", requesterId = "u5", communityId = "c3",
            title = "Laptop setup help for new student",
            description = "Just joined VIT and need help setting up Linux dual-boot on my laptop. Any experienced seniors?",
            category = "technology", status = "pending", createdAt = "2026-03-24T11:45:00Z",
            requester = User(id = "u5", name = "Deepa Gupta")
        ),
    )

    val conversations = listOf(
        Conversation(
            requestId = "r1",
            otherUser = User(id = "u2", name = "Rahul Menon"),
            lastMessage = Message(id = "m1", senderId = "u2", receiverId = "u1", requestId = "r1", content = "I can pick those up for you around 5 PM!", createdAt = "2026-03-28T11:00:00Z"),
            unreadCount = 2
        ),
        Conversation(
            requestId = "r3",
            otherUser = User(id = "u3", name = "Priya Nair"),
            lastMessage = Message(id = "m2", senderId = "u3", receiverId = "u1", requestId = "r3", content = "Thanks for volunteering! I'll share the details.", createdAt = "2026-03-27T16:30:00Z"),
            unreadCount = 0
        ),
    )

    val messages = listOf(
        Message(id = "m1", senderId = "u2", receiverId = "u1", requestId = "r1", content = "Hi! I saw your request for grocery help.", createdAt = "2026-03-28T10:45:00Z",
            sender = User(id = "u2", name = "Rahul Menon")),
        Message(id = "m2", senderId = "u1", receiverId = "u2", requestId = "r1", content = "Yes! That would be super helpful.", createdAt = "2026-03-28T10:50:00Z",
            sender = User(id = "u1", name = "Ananya Sharma")),
        Message(id = "m3", senderId = "u2", receiverId = "u1", requestId = "r1", content = "I can pick those up for you around 5 PM!", createdAt = "2026-03-28T11:00:00Z",
            sender = User(id = "u2", name = "Rahul Menon")),
    )

    val walletInfo = WalletInfo(
        balance = 1250.0,
        totalEarned = 3500.0,
        totalSpent = 2250.0,
        pendingAmount = 500.0
    )

    val transactions = listOf(
        Transaction(id = "t1", requestId = "r2", payerId = "u1", payeeId = "u2", amount = 350.0, status = "completed", createdAt = "2026-03-27T15:00:00Z", completedAt = "2026-03-27T18:00:00Z"),
        Transaction(id = "t2", requestId = "r4", payerId = "u4", payeeId = "u1", amount = 150.0, status = "completed", createdAt = "2026-03-25T08:00:00Z", completedAt = "2026-03-25T09:00:00Z"),
        Transaction(id = "t3", requestId = "r1", payerId = "u1", payeeId = "u2", amount = 500.0, status = "pending", createdAt = "2026-03-28T11:30:00Z"),
    )

    val reputationInfo = ReputationInfo(
        userId = "guest_0000",
        totalPoints = 2450,
        helperScore = 1800,
        requesterScore = 650,
        badges = listOf(
            Badge(id = "b1", type = "helper", name = "First Helper", description = "Completed first help request", icon = "🤝"),
            Badge(id = "b2", type = "streak", name = "3-Day Streak", description = "Active for 3 consecutive days", icon = "🔥"),
            Badge(id = "b3", type = "community", name = "Community Builder", description = "Created your first community", icon = "🏘️"),
        ),
        rank = 12
    )

    val badges = reputationInfo.badges

    val leaderboard = listOf(
        LeaderboardEntry(userId = "u1", name = "Ananya Sharma", totalPoints = 5200, rank = 1),
        LeaderboardEntry(userId = "u2", name = "Rahul Menon", totalPoints = 4800, rank = 2),
        LeaderboardEntry(userId = "u3", name = "Priya Nair", totalPoints = 3950, rank = 3),
        LeaderboardEntry(userId = "u4", name = "Karthik Iyer", totalPoints = 3200, rank = 4),
        LeaderboardEntry(userId = "u5", name = "Deepa Gupta", totalPoints = 2900, rank = 5),
    )

    val notifications = listOf(
        Notification(id = "n1", userId = "u1", type = "response", title = "New Response", message = "Rahul Menon responded to your grocery help request", createdAt = "2026-03-28T11:00:00Z"),
        Notification(id = "n2", userId = "u1", type = "badge", title = "Badge Earned!", message = "You earned the 'Community Builder' badge", createdAt = "2026-03-27T09:00:00Z"),
        Notification(id = "n3", userId = "u1", type = "payment", title = "Payment Received", message = "₹150 received for ride request from Karthik", createdAt = "2026-03-25T09:00:00Z"),
    )

    val helpCategories = listOf(
        HelpCategory("groceries", "Groceries", "Grocery shopping, delivery, or pickup", "🛒", 0xFF3B82F6),
        HelpCategory("repairs", "Home Repairs", "Minor repairs, maintenance, handyman", "🔧", 0xFFF97316),
        HelpCategory("babysitting", "Childcare", "Babysitting, child supervision", "👶", 0xFFEC4899),
        HelpCategory("transportation", "Transportation", "Rides, carpooling, transport", "🚗", 0xFF22C55E),
        HelpCategory("petcare", "Pet Care", "Pet sitting, walking, care", "🐕", 0xFF8B5CF6),
        HelpCategory("eldercare", "Elder Care", "Elderly assistance", "👴", 0xFF6366F1),
        HelpCategory("technology", "Tech Help", "Tech support, device setup", "💻", 0xFF06B6D4),
        HelpCategory("cleaning", "Cleaning", "House cleaning, yard work", "🧹", 0xFFEAB308),
        HelpCategory("other", "Other", "Other types of help", "🤝", 0xFF6B7280),
    )
}
