"use server"
import { createMint, getOrCreateAssociatedTokenAccount, mintTo, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { connection, host } from "./config";
import { PublicKey, Keypair } from "@solana/web3.js";
import { Metaplex } from "@metaplex-foundation/js";

export async function createSPLToken(WALLET_KEYPAIR: Keypair) {

  console.log("Creating a new SPL token...");

  // ✅ Create Mint (Token)
  const mint = await createMint(
    connection,          // Solana connection
    WALLET_KEYPAIR,      // Payer (wallet creating the token)
    WALLET_KEYPAIR.publicKey, // Authority to mint new tokens
    null,                // (Optional) Freeze authority (null if not needed)
    9,                   // Decimals (9 is common for SPL tokens)
    undefined,
    {},
    TOKEN_PROGRAM_ID
  );

  console.log(`✅ Token Mint Created: ${mint.toBase58()}`);

  // ✅ Create an Associated Token Account for this Wallet
  const tokenAccount = await getOrCreateAssociatedTokenAccount(
    connection, 
    WALLET_KEYPAIR, 
    mint, 
    WALLET_KEYPAIR.publicKey 
  );

  console.log(`✅ Associated Token Account Created: ${tokenAccount.address.toBase58()}`);

  // ✅ Mint Some Tokens (e.g., 1000 tokens with 9 decimals)
  await mintTo(
    connection, 
    WALLET_KEYPAIR, 
    mint, 
    tokenAccount.address, 
    WALLET_KEYPAIR.publicKey, 
    1_000_000_000_000 // 1000 tokens (adjust decimals accordingly)
  );

  console.log("✅ Tokens Minted!");

  // Define token metadata
  const metadata = {
    name: "My Token",
    symbol: "MTK",
    description: "A unique Solana token.",
    image: "https://static.vecteezy.com/system/resources/thumbnails/024/553/534/small_2x/lion-head-logo-mascot-wildlife-animal-illustration-generative-ai-png.png",
    decimals: 9,
    properties: {
      files: [
        {
          uri: "https://static.vecteezy.com/system/resources/thumbnails/024/553/534/small_2x/lion-head-logo-mascot-wildlife-animal-illustration-generative-ai-png.png",
          type: "image/png",
        }
      ]
    }
  };

  // Generate metadata URI
  const metadataUri = await uploadMetadataPinata(metadata);

  // Create token metadata input structure
  const TOKEN_METADATA = {
    name: metadata.name,
    symbol: metadata.symbol,
    uri: metadataUri
  };

  // Set the token metadata
  await setTokenMetadata(mint, WALLET_KEYPAIR, TOKEN_METADATA);
  
  return {
    mint: mint.toBase58(),
    tokenAccount: tokenAccount.address.toBase58()
  };
}

// Function to generate metadata URI

async function uploadMetadataPinata(metadata: any) {
  const response = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
    method: "POST",
    headers: {
      "pinata_api_key": process.env.PINATA_API_KEY || "",
      "pinata_secret_api_key": process.env.PINATA_API_SECRET || "",
      "Content-Type": "application/json"
    },
    body: JSON.stringify(metadata)
  });

  const result = await response.json();
  return `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`;
}

// Function to Set Metadata
async function setTokenMetadata(mint: PublicKey,WALLET_KEYPAIR: Keypair, tokenMetadata: { name: string, symbol: string, uri: string }) {
  try {
    const metaplex = Metaplex.make(connection)
      .use(keypairIdentity(WALLET_KEYPAIR));

    // We need to create NFT metadata in a different way since we already have a mint
    // In newer Metaplex versions, we can use the createMetadata method directly
    const { nft } = await metaplex.nfts().create({
      // Instead of using the existing mint as useNewMint, we'll create a new NFT metadata
      uri: tokenMetadata.uri,
      name: tokenMetadata.name,
      sellerFeeBasisPoints: 0,
      symbol: tokenMetadata.symbol,
      creators: [{ address: WALLET_KEYPAIR.publicKey, share: 100 }],
      isMutable: true,
      updateAuthority: WALLET_KEYPAIR,
    });

    console.log(`✅ Metadata Created: ${nft.address.toBase58()}`);
    return nft;
  } catch (error) {
    console.error("Error creating token metadata:", error);
    throw error;
  }
}

// Missing keypairIdentity function, needs to be implemented if not available
function keypairIdentity(keypair: any) {
  return {
    install(metaplex: any) {
      metaplex.identity = () => keypair;
      return metaplex;
    }
  };
}