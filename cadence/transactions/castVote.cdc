import Voting from 0xVOTING_CONTRACT_ADDRESS

transaction(proposalId: UInt64, voteFor: Bool) {
    prepare(signer: AuthAccount) {}

    execute {
        Voting.vote(proposalId: proposalId, voteFor: voteFor)
    }
}