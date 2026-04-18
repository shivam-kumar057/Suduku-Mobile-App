import {
  BannerAd,
  BannerAdSize,
  InterstitialAd,
  RewardedAd,
  RewardedAdEventType,
  TestIds,
  AdEventType,
} from 'react-native-google-mobile-ads';

export const bannerAdUnitId = TestIds.BANNER;
export const interstitialAdUnitId = TestIds.INTERSTITIAL;
export const rewardedAdUnitId = TestIds.REWARDED;

const interstitial = InterstitialAd.createForAdRequest(interstitialAdUnitId);
const rewarded = RewardedAd.createForAdRequest(rewardedAdUnitId);

let interstitialLoaded = false;
let rewardedLoaded = false;

interstitial.addAdEventListener(AdEventType.LOADED, () => {
  interstitialLoaded = true;
});

interstitial.addAdEventListener(AdEventType.CLOSED, () => {
  interstitialLoaded = false;
  interstitial.load();
});

rewarded.addAdEventListener(RewardedAdEventType.LOADED, () => {
  rewardedLoaded = true;
});

rewarded.addAdEventListener(AdEventType.CLOSED, () => {
  rewardedLoaded = false;
  rewarded.load();
});

export const preloadAds = () => {
  interstitial.load();
  rewarded.load();
};

export const showInterstitialAd = async () => {
  if (interstitialLoaded) {
    await interstitial.show();
  } else {
    interstitial.load();
  }
};

export const showRewardedHintAd = async (onReward: () => void) => {
  if (!rewardedLoaded) {
    rewarded.load();
    return false;
  }

  return new Promise<boolean>(resolve => {
    let rewardedEarned = false;

    const unsubscribe = rewarded.addAdEventListener(
      RewardedAdEventType.EARNED_REWARD,
      () => {
        rewardedEarned = true;
        onReward();
      },
    );

    const closeUnsubscribe = rewarded.addAdEventListener(AdEventType.CLOSED, () => {
      resolve(rewardedEarned);
      closeUnsubscribe();
    });

    rewarded.show().finally(() => {
      unsubscribe();
    });
  });
};

export { BannerAd, BannerAdSize };
