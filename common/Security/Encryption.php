<?php declare(strict_types=1);

namespace Common\Security;

/**
 * Encryption
 *
 * Thin libsodium secretbox helper for field-level encryption of
 * high-sensitivity values (e.g. TOTP secrets, API credentials). Uses the
 * app-wide `encryption.key` from common/Config/.env, hashed down to the
 * exact key size secretbox requires so the source key can be any length.
 *
 * Ciphertext format (base64): nonce (24 bytes) + secretbox output.
 *
 * @package Common\Security
 */
class Encryption
{
	/**
	 * Cached 32-byte secretbox key, derived once per request.
	 *
	 * @var string|null
	 */
	protected static ?string $key = null;

	/**
	 * Encrypts a plaintext string.
	 *
	 * @param string $plaintext
	 * @return string Base64-encoded nonce + ciphertext.
	 */
	public static function encrypt(string $plaintext): string
	{
		$nonce = random_bytes(SODIUM_CRYPTO_SECRETBOX_NONCEBYTES);
		$ciphertext = sodium_crypto_secretbox($plaintext, $nonce, self::getKey());

		return base64_encode($nonce . $ciphertext);
	}

	/**
	 * Decrypts a value produced by encrypt(). Returns null on any
	 * failure (bad key, tampered ciphertext, malformed input) rather
	 * than throwing — callers treat a null as "credential unusable".
	 *
	 * @param string $encoded
	 * @return string|null
	 */
	public static function decrypt(string $encoded): ?string
	{
		$raw = base64_decode($encoded, true);
		if ($raw === false || strlen($raw) < SODIUM_CRYPTO_SECRETBOX_NONCEBYTES)
		{
			return null;
		}

		$nonce = substr($raw, 0, SODIUM_CRYPTO_SECRETBOX_NONCEBYTES);
		$ciphertext = substr($raw, SODIUM_CRYPTO_SECRETBOX_NONCEBYTES);

		$plaintext = sodium_crypto_secretbox_open($ciphertext, $nonce, self::getKey());
		return ($plaintext === false) ? null : $plaintext;
	}

	/**
	 * Derives the 32-byte secretbox key from `encryption.key`.
	 *
	 * @return string
	 */
	protected static function getKey(): string
	{
		if (self::$key !== null)
		{
			return self::$key;
		}

		$configured = env('encryption')->key ?? null;
		if (!$configured)
		{
			throw new \RuntimeException('Encryption: encryption.key is not configured.');
		}

		return self::$key = sodium_crypto_generichash($configured, '', SODIUM_CRYPTO_SECRETBOX_KEYBYTES);
	}
}
