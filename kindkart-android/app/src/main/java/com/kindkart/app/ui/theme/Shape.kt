package com.kindkart.app.ui.theme

import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Shapes
import androidx.compose.ui.unit.dp

val KindKartShapes = Shapes(
    extraSmall = RoundedCornerShape(6.dp),   // radius-sm
    small = RoundedCornerShape(8.dp),        // radius-md
    medium = RoundedCornerShape(12.dp),      // radius-lg
    large = RoundedCornerShape(16.dp),       // radius-xl  (cards)
    extraLarge = RoundedCornerShape(24.dp),  // radius-2xl (bottom sheets, dialogs)
)

// Additional shape constants
val CardShape = RoundedCornerShape(16.dp)
val ButtonShape = RoundedCornerShape(24.dp)   // rounded-full buttons
val ChipShape = RoundedCornerShape(20.dp)
val InputShape = RoundedCornerShape(16.dp)
val BadgeShape = RoundedCornerShape(20.dp)
val BottomSheetShape = RoundedCornerShape(topStart = 24.dp, topEnd = 24.dp)
