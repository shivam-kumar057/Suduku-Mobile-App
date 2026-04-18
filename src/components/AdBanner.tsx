import React from 'react';
import { View } from 'react-native';
import { BannerAd, BannerAdSize, bannerAdUnitId } from '../services/ads';

export function AdBanner() {
  return (
    <View style={{ alignItems: 'center' }}>
      <BannerAd unitId={bannerAdUnitId} size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER} />
    </View>
  );
}
