package com.example.backend.repository;

import com.example.backend.entity.MasterDataItem;
import com.example.backend.enums.MasterDataType;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MasterDataItemRepository extends MongoRepository<MasterDataItem, String> {
    List<MasterDataItem> findByTypeAndActiveTrue(MasterDataType type);
    boolean existsByTypeAndName(MasterDataType type, String name);
}
