package com.example.backend.entity.embedded;

import com.example.backend.enums.GearType;

/** Một thiết bị trong bộ đồ nghề của thí sinh, nhúng trong users.gear. */
public record GearItem(
        GearType type,
        String name
) {
}
