<?php declare(strict_types=1);
namespace Common\Integrations\Stripe;

use Proto\Integrations\RestService;

/**
 * StripeService
 *
 * Integration with Stripe for payment processing.
 *
 * @package Common\Integrations\Stripe
 */
class StripeService extends RestService
{
    /**
     * Base URL for Stripe API.
     *
     * @var string
     */
    protected string $url = 'https://api.stripe.com/v1';

    /**
     * Headers for Stripe API requests.
     *
     * @var array
     */
    protected array $headers = [];

    /**
     * Constructor.
     */
    public function __construct()
    {
        $settings = env('apis')->stripe ?? throw new \Exception('Stripe API settings not configured.');

        $this->headers = [
            'Authorization: Bearer ' . $settings->secretKey,
            'Content-Type: application/x-www-form-urlencoded'
        ];
    }

    /**
     * Create a payment intent.
     *
     * @param float $amount The amount to charge.
     * @param string $currency The currency code (default: usd).
     * @param array $metadata Additional metadata for the payment.
     * @return object|null
     */
    public function createPaymentIntent(float $amount, string $currency = 'usd', array $metadata = []): ?object
    {
        $data = [
            'amount' => (int)($amount * 100), // Convert to cents
            'currency' => $currency,
            'metadata' => $metadata
        ];

        return $this->fetch('POST', '/payment_intents', $data);
    }

    /**
     * Create a customer.
     *
     * @param string $email The customer's email address.
     * @param string|null $name The customer's name.
     * @param array $metadata Additional metadata for the customer.
     * @return object|null
     */
    public function createCustomer(string $email, ?string $name = null, array $metadata = []): ?object
    {
        $data = [
            'email' => $email,
            'metadata' => $metadata
        ];

        if ($name)
        {
            $data['name'] = $name;
        }

        return $this->fetch('POST', '/customers', $data);
    }

    /**
     * Create a subscription.
     *
     * @param string $customerId The Stripe customer ID.
     * @param string $priceId The Stripe price ID.
     * @param array $metadata Additional metadata for the subscription.
     * @return object|null
     */
    public function createSubscription(string $customerId, string $priceId, array $metadata = []): ?object
    {
        $data = [
            'customer' => $customerId,
            'items' => [
                ['price' => $priceId]
            ],
            'metadata' => $metadata
        ];

        return $this->fetch('POST', '/subscriptions', $data);
    }

    /**
     * Cancel a subscription.
     *
     * @param string $subscriptionId The Stripe subscription ID.
     * @return object|null
     */
    public function cancelSubscription(string $subscriptionId): ?object
    {
        return $this->fetch('DELETE', "/subscriptions/{$subscriptionId}");
    }

    /**
     * Get a payment intent.
     *
     * @param string $paymentIntentId The Stripe payment intent ID.
     * @return object|null
     */
    public function getPaymentIntent(string $paymentIntentId): ?object
    {
        return $this->fetch('GET', "/payment_intents/{$paymentIntentId}");
    }

    /**
     * Get a subscription.
     *
     * @param string $subscriptionId The Stripe subscription ID.
     * @return object|null
     */
    public function getSubscription(string $subscriptionId): ?object
    {
        return $this->fetch('GET', "/subscriptions/{$subscriptionId}");
    }

    /**
     * Create a price.
     *
     * @param float $amount The price amount.
     * @param string $currency The currency code.
     * @param string $interval The billing interval (day, week, month, year).
     * @param string $productId The Stripe product ID.
     * @return object|null
     */
    public function createPrice(float $amount, string $currency, string $interval, string $productId): ?object
    {
        $data = [
            'unit_amount' => (int)($amount * 100),
            'currency' => $currency,
            'recurring' => [
                'interval' => $interval
            ],
            'product' => $productId
        ];

        return $this->fetch('POST', '/prices', $data);
    }

    /**
     * Create a product.
     *
     * @param string $name The product name.
     * @param string|null $description The product description.
     * @param array $metadata Additional metadata for the product.
     * @return object|null
     */
    public function createProduct(string $name, ?string $description = null, array $metadata = []): ?object
    {
        $data = [
            'name' => $name,
            'metadata' => $metadata
        ];

        if ($description)
        {
            $data['description'] = $description;
        }

        return $this->fetch('POST', '/products', $data);
    }

    /**
     * Refund a payment.
     *
     * @param string $paymentIntentId The Stripe payment intent ID.
     * @param float|null $amount The amount to refund (null for full refund).
     * @return object|null
     */
    public function refundPayment(string $paymentIntentId, ?float $amount = null): ?object
    {
        $data = ['payment_intent' => $paymentIntentId];

        if ($amount)
        {
            $data['amount'] = (int)($amount * 100);
        }

        return $this->fetch('POST', '/refunds', $data);
    }
}
