import Voting from 0xVOTING_CONTRACT_ADDRESS

transaction(title: String, description: String, endTime: UFix64) {
    prepare(signer: AuthAccount) {}

    execute {
        Voting.createProposal(title: title, description: description, endTime: endTime)
    }
}