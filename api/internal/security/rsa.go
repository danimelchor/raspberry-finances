package security

import (
	"log"
	"os"

	"github.com/fatih/color"

	"crypto/rand"
	"crypto/rsa"
	"crypto/x509"
	"encoding/pem"
)

func GenerateRSAKeys() error {
	key, err := rsa.GenerateKey(rand.Reader, 4096)
	if err != nil {
		log.Fatal("Error generating RSA keys: ", err)
	}

	// Extract public component.
	pub := key.Public()

	// Encode private key to PKCS#1 ASN.1 PEM.
	keyPEM := pem.EncodeToMemory(
		&pem.Block{
			Type:  "RSA PRIVATE KEY",
			Bytes: x509.MarshalPKCS1PrivateKey(key),
		},
	)

	// Encode public key to PKCS#1 ASN.1 PEM.
	pubPEM := pem.EncodeToMemory(
		&pem.Block{
			Type:  "RSA PUBLIC KEY",
			Bytes: x509.MarshalPKCS1PublicKey(pub.(*rsa.PublicKey)),
		},
	)

	// Write private key to file.
	if err := os.WriteFile("jwt.rsa", keyPEM, 0700); err != nil {
		log.Fatal("Error writing private key to file: ", err)
	}

	// Write public key to file.
	if err := os.WriteFile("jwt.rsa.pub", pubPEM, 0755); err != nil {
		log.Fatal("Error writing public key to file: ", err)
	}

	color.Green("RSA keys generated successfully")
	return nil
}

func LoadRsa() (*rsa.PrivateKey, error) {
	privateKeyPath := "jwt.rsa"
	privateKey, err := os.ReadFile(privateKeyPath)
	if err != nil {
		return nil, err
	}
	block, _ := pem.Decode(privateKey)
	if block == nil {
		return nil, err
	}
	privateKeyParsed, err := x509.ParsePKCS1PrivateKey(block.Bytes)
	if err != nil {
		return nil, err
	}
	return privateKeyParsed, nil
}

func LoadRsaPub() (*rsa.PublicKey, error) {
	publicKeyPath := "jwt.rsa.pub"
	publicKey, err := os.ReadFile(publicKeyPath)
	if err != nil {
		return nil, err
	}
	block, _ := pem.Decode(publicKey)
	if block == nil {
		return nil, err
	}
	publicKeyParsed, err := x509.ParsePKCS1PublicKey(block.Bytes)
	if err != nil {
		return nil, err
	}
	return publicKeyParsed, nil
}

func MustGenerateRSAKeysIfNotExist() {
	_, err := os.Stat("jwt.rsa")
	if os.IsNotExist(err) {
		err = GenerateRSAKeys()
		if err != nil {
			log.Fatal("Error generating RSA keys: ", err)
		}
	}
}
