package com.example.backend.tv3.storage;

import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;
import org.springframework.transaction.support.*;

@Component
@Profile("tv3")
public class TransactionalImages {
    private final ImageStorage storage;

    public TransactionalImages(ImageStorage storage) {
        this.storage = storage;
    }

    public ImageStorage.Asset upload(byte[] bytes) {
        requireTransaction();
        var asset = storage.upload(bytes);
        TransactionSynchronizationManager.registerSynchronization(
                new TransactionSynchronization() {
                    @Override
                    public void afterCompletion(int status) {
                        if (status == STATUS_ROLLED_BACK) cleanup(asset.publicId());
                        else if (status == STATUS_UNKNOWN)
                            org.slf4j.LoggerFactory.getLogger(getClass())
                                    .warn(
                                            "Cloud reconciliation required (unknown transaction"
                                                + " outcome): {}",
                                            asset.publicId());
                    }
                });
        return asset;
    }

    public void deleteAfterCommit(String id) {
        if (id == null) return;
        requireTransaction();
        TransactionSynchronizationManager.registerSynchronization(
                new TransactionSynchronization() {
                    @Override
                    public void afterCommit() {
                        cleanup(id);
                    }
                });
    }

    private void requireTransaction() {
        if (!TransactionSynchronizationManager.isActualTransactionActive())
            throw new IllegalStateException("Cloud operation requires an active transaction");
    }

    private void cleanup(String id) {
        try {
            storage.delete(id);
        } catch (RuntimeException e) {
            org.slf4j.LoggerFactory.getLogger(getClass())
                    .error("Cloud cleanup requires retry: {}", id);
        }
    }
}
