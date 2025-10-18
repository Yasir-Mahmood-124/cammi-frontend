'use client';

import React from 'react';

interface PlanFeature {
  text: string;
  included: boolean;
}

interface PricingPlan {
  name: string;
  price: number;
  period: string;
  isPopular?: boolean;
  isCurrent?: boolean;
  features: PlanFeature[];
}

const pricingPlans: PricingPlan[] = [
  {
    name: 'Basic Plan',
    price: 0,
    period: 'Per editor/month billed monthly',
    isCurrent: true,
    features: [
      { text: '30h Fast generations', included: true },
      { text: 'Unlimited Relaxed generations', included: false },
      { text: 'General commercial terms', included: false },
      { text: 'Access to member gallery', included: false },
      { text: 'Optional credit top ups', included: false },
      { text: '3 concurrent fast jobs', included: false },
      { text: '12 concurrent fast jobs', included: false },
      { text: 'Access to member gallery', included: false },
      { text: 'Optional credit top ups', included: false },
    ],
  },
  {
    name: 'Standard Plan',
    price: 30,
    period: 'Per editor/month billed monthly',
    isPopular: true,
    features: [
      { text: '15h Fast generations', included: true },
      { text: 'Unlimited Relaxed generations', included: true },
      { text: 'General commercial terms', included: true },
      { text: 'Access to member gallery', included: true },
      { text: 'Optional credit top ups', included: true },
      { text: '3 concurrent fast jobs', included: true },
      { text: 'Access to member gallery', included: true },
      { text: 'Optional credit top ups', included: true },
    ],
  },
  {
    name: 'Pro Plan',
    price: 60,
    period: 'Per editor/month billed monthly',
    features: [
      { text: '30h Fast generations', included: true },
      { text: 'Unlimited Relaxed generations', included: false },
      { text: 'General commercial terms', included: false },
      { text: 'Access to member gallery', included: false },
      { text: 'Optional credit top ups', included: false },
      { text: '3 concurrent fast jobs', included: false },
    ],
  },
  {
    name: 'Unlimited Plan',
    price: 120,
    period: 'Per editor/month billed monthly',
    features: [
      { text: '60h Fast generations', included: true },
      { text: 'Unlimited Relaxed generations', included: false },
      { text: 'General commercial terms', included: false },
      { text: 'Access to member gallery', included: false },
      { text: 'Optional credit top ups', included: false },
      { text: '3 concurrent fast jobs', included: false },
      { text: '12 concurrent fast jobs', included: false },
    ],
  },
];

const PricingCard: React.FC<{ plan: PricingPlan; onChoosePlan: () => void }> = ({
  plan,
  onChoosePlan,
}) => {
  const isPopular = plan.isPopular;
  const isCurrent = plan.isCurrent;

  return (
    <div
      style={{
        position: 'relative',
        height: '100%',
        borderRadius: '24px',
        background: isPopular
          ? 'linear-gradient(180deg, #3EA3FF 0%, #2E8FE8 100%)'
          : '#FFFFFF',
        border: isPopular ? 'none' : '1px solid #E0E0E0',
        boxShadow: isPopular
          ? '0 8px 24px rgba(62, 163, 255, 0.3)'
          : '0 2px 8px rgba(0, 0, 0, 0.08)',
        transition: 'all 0.3s ease',
        padding: '32px 24px',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = isPopular
          ? '0 12px 32px rgba(62, 163, 255, 0.4)'
          : '0 8px 16px rgba(0, 0, 0, 0.12)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = isPopular
          ? '0 8px 24px rgba(62, 163, 255, 0.3)'
          : '0 2px 8px rgba(0, 0, 0, 0.08)';
      }}
    >
      {isPopular && (
        <div
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            backgroundColor: '#FFFFFF',
            color: '#3EA3FF',
            fontWeight: 600,
            fontSize: '11px',
            padding: '4px 12px',
            borderRadius: '12px',
          }}
        >
          Most Popular
        </div>
      )}

      <h3
        style={{
          color: isPopular ? '#FFFFFF' : '#000000',
          fontWeight: 600,
          fontSize: '18px',
          marginBottom: '16px',
          marginTop: 0,
        }}
      >
        {plan.name}
      </h3>

      <div style={{ marginBottom: '24px' }}>
        <span
          style={{
            color: isPopular ? '#FFFFFF' : '#000000',
            fontWeight: 700,
            fontSize: '48px',
            lineHeight: 1,
          }}
        >
          ${plan.price}
        </span>
        <span
          style={{
            color: isPopular ? 'rgba(255, 255, 255, 0.8)' : '#666666',
            fontSize: '13px',
            marginLeft: '8px',
          }}
        >
          {plan.period}
        </span>
      </div>

      <div style={{ marginBottom: '24px' }}>
        {plan.features.map((feature, index) => (
          <div
            key={index}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '12px',
            }}
          >
            {feature.included ? (
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  fill={isPopular ? '#FFFFFF' : '#3EA3FF'}
                />
                <path
                  d="M7 12L10.5 15.5L17 9"
                  stroke={isPopular ? '#3EA3FF' : '#FFFFFF'}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            ) : (
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  fill={isPopular ? 'rgba(255, 255, 255, 0.4)' : '#CCCCCC'}
                />
                <path
                  d="M8 8L16 16M16 8L8 16"
                  stroke={isPopular ? '#3EA3FF' : '#FFFFFF'}
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            )}
            <span
              style={{
                color: feature.included
                  ? isPopular
                    ? '#FFFFFF'
                    : '#000000'
                  : isPopular
                  ? 'rgba(255, 255, 255, 0.6)'
                  : '#999999',
                fontSize: '14px',
                fontWeight: feature.included ? 500 : 400,
              }}
            >
              {feature.text}
            </span>
          </div>
        ))}
      </div>

      <button
        onClick={onChoosePlan}
        disabled={isCurrent}
        style={{
          width: '100%',
          backgroundColor: isPopular
            ? '#FFFFFF'
            : isCurrent
            ? 'transparent'
            : '#B3D9F2',
          color: isPopular ? '#3EA3FF' : isCurrent ? '#B3D9F2' : '#3EA3FF',
          borderRadius: '12px',
          padding: '12px',
          fontSize: '15px',
          fontWeight: 600,
          border: isCurrent ? '2px solid #B3D9F2' : 'none',
          cursor: isCurrent ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={(e) => {
          if (!isCurrent) {
            e.currentTarget.style.backgroundColor = isPopular ? '#F5F5F5' : '#9ECCE8';
          }
        }}
        onMouseLeave={(e) => {
          if (!isCurrent) {
            e.currentTarget.style.backgroundColor = isPopular ? '#FFFFFF' : '#B3D9F2';
          }
        }}
      >
        {isCurrent ? 'Current Plan' : 'Choose Plan'}
      </button>
    </div>
  );
};

const PricingPlans: React.FC = () => {
  const handleChoosePlan = (planName: string) => {
    console.log(`Selected plan: ${planName}`);
    // Add your plan selection logic here
  };

  return (
    <div
      style={{
        minHeight: 'calc(100vh - 64px)',
        backgroundColor: '#F5F7FA',
        padding: '48px 24px',
      }}
    >
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <h1
          style={{
            textAlign: 'center',
            fontWeight: 700,
            fontSize: '36px',
            color: '#000000',
            marginBottom: '12px',
            marginTop: 0,
          }}
        >
          Purchase Credit
        </h1>
        <p
          style={{
            textAlign: 'center',
            fontSize: '16px',
            color: '#666666',
            marginBottom: '48px',
            marginTop: 0,
          }}
        >
          Choose the plan that works for you.
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '24px',
            maxWidth: '1200px',
            margin: '0 auto',
          }}
        >
          {pricingPlans.map((plan, index) => (
            <PricingCard
              key={index}
              plan={plan}
              onChoosePlan={() => handleChoosePlan(plan.name)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default PricingPlans;