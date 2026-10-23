package com.example.backend.entity;

import com.example.backend.enums.MasterDataType;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;

/** Danh mục dùng chung (hãng phim, máy ảnh, ống kính...) do Admin quản lý. */
@CompoundIndex(name = "type_name_unique", def = "{'type': 1, 'name': 1}", unique = true)
@Document(collection = "master_data")
public class MasterDataItem extends BaseDocument {

    private MasterDataType type;

    private String name;

    private String brand;

    /** Ẩn khỏi dropdown thay vì xóa để bài cũ vẫn hợp lệ */
    private boolean active = true;

    public MasterDataItem() {
    }

    public MasterDataType getType() {
        return type;
    }

    public void setType(MasterDataType type) {
        this.type = type;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getBrand() {
        return brand;
    }

    public void setBrand(String brand) {
        this.brand = brand;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }
}
