const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");

describe("TokenStorage", function () {
	// We define a fixture to reuse the same setup in every test.
	// We use loadFixture to run this setup once, snapshot that state,
	// and reset Hardhat Network to that snapshot in every test.
	async function deployContracts() {
		// Contracts are deployed using the first signer/account by default
		const [owner, depositor] = await ethers.getSigners();

		const TestToken = await ethers.getContractFactory("TestToken");
		const testToken = await TestToken.deploy();

		// Mint 10000 tokens(6 decimals) to depositor
		testToken.mint(depositor.address, 10000000000);

		const TokenStorage = await ethers.getContractFactory("TokenStorage");
		const tokenStorage = await TokenStorage.deploy();

		return { testToken, tokenStorage, owner, depositor };
	}

	describe("deposit", function () {
		describe("positive cases", function () {
			it("should deposit token amount", async function () {
				const { testToken, tokenStorage, owner, depositor } = await loadFixture(
					deployContracts
				);
				await testToken
					.connect(depositor)
					.approve(tokenStorage.address, 1000000000);
				const before = await testToken.balanceOf(depositor.address);
				await tokenStorage
					.connect(depositor)
					.deposit(testToken.address, 1000000000);
				const after = await testToken.balanceOf(depositor.address);
				expect(
					await tokenStorage.deposited(depositor.address, testToken.address)
				).to.equal(1000000000);
				expect(await testToken.balanceOf(tokenStorage.address)).to.equal(
					1000000000
				);
				expect(before.sub(after)).to.equal(1000000000);
			});
		});
		describe("negative cases", function () {
			it("should revert if deposit amount is greater than max capacity", async function () {
				const { testToken, tokenStorage, owner, depositor } = await loadFixture(
					deployContracts
				);
				await testToken
					.connect(depositor)
					.approve(tokenStorage.address, 1501000000);

				await expect(
					tokenStorage.connect(depositor).deposit(testToken.address, 1501000000)
				).to.be.revertedWith("transfer exceeds capacity");
			});

			it("should revert if deposited amount + amount is greater than max capacity", async function () {
				const { testToken, tokenStorage, owner, depositor } = await loadFixture(
					deployContracts
				);
				await testToken
					.connect(depositor)
					.approve(tokenStorage.address, 1501000000);
				await tokenStorage
					.connect(depositor)
					.deposit(testToken.address, 1500000000);
				await expect(
					tokenStorage.connect(depositor).deposit(testToken.address, 1000000)
				).to.be.revertedWith("transfer exceeds capacity");
			});
		});
	});

	describe("withdraw", function () {
		describe("positive cases", function () {
			it("should withdraw token amount", async function () {
				const { testToken, tokenStorage, owner, depositor } = await loadFixture(
					deployContracts
				);
				await testToken
					.connect(depositor)
					.approve(tokenStorage.address, 1000000000);
				const before = await testToken.balanceOf(depositor.address);
				await tokenStorage
					.connect(depositor)
					.deposit(testToken.address, 1000000000);
				await tokenStorage
					.connect(depositor)
					.withdraw(testToken.address, 1000000000);
				const after = await testToken.balanceOf(depositor.address);

				expect(
					await tokenStorage.deposited(depositor.address, testToken.address)
				).to.equal(0);
				expect(await testToken.balanceOf(tokenStorage.address)).to.equal(0);
				expect(after.sub(before)).to.equal(0);
			});
		});
		describe("negative cases", function () {
			it("should revert if deposttor has insufficient balance to withdraw", async function () {
				const { testToken, tokenStorage, owner, depositor } = await loadFixture(
					deployContracts
				);
				await testToken
					.connect(depositor)
					.approve(tokenStorage.address, 1000000000);

				await expect(
					tokenStorage
						.connect(depositor)
						.withdraw(testToken.address, 1000000000)
				).to.be.revertedWith("insufficient balance");
			});
		});
	});

	describe("getSlab", function () {
		describe("positive cases", function () {
			it("should get correct slab number", async function () {
				const { testToken, tokenStorage, owner, depositor } = await loadFixture(
					deployContracts
				);
				await testToken
					.connect(depositor)
					.approve(tokenStorage.address, 1000000000);
				await tokenStorage
					.connect(depositor)
					.deposit(testToken.address, 1000000000);
				expect(
					await tokenStorage.connect(depositor).getSlab(testToken.address)
				).to.equal(2);
			});
		});
		describe("negative cases", function () {
			it("should revert if deposttor has 0 funds in contract", async function () {
				const { testToken, tokenStorage, owner, depositor } = await loadFixture(
					deployContracts
				);
				await testToken
					.connect(depositor)
					.approve(tokenStorage.address, 1000000000);

				await expect(
					tokenStorage.connect(depositor).getSlab(testToken.address)
				).to.be.revertedWith("no slab found");
			});
		});
	});
});
