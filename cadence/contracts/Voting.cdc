pub contract Voting {

    pub struct Proposal {
        pub let id: UInt64
        pub let title: String
        pub let description: String
        pub let creator: Address
        pub let votesFor: UInt64
        pub let votesAgainst: UInt64
        pub let endTime: UFix64

        init(id: UInt64, title: String, description: String, creator: Address, endTime: UFix64) {
            self.id = id
            self.title = title
            self.description = description
            self.creator = creator
            self.votesFor = 0
            self.votesAgainst = 0
            self.endTime = endTime
        }
    }

    pub var proposals: {UInt64: Proposal}
    pub var nextProposalId: UInt64
    pub var hasVoted: {Address: {UInt64: Bool}}

    init() {
        self.proposals = {}
        self.nextProposalId = 1
        self.hasVoted = {}
    }

    pub fun createProposal(title: String, description: String, endTime: UFix64) {
        let proposal = Proposal(
            id: self.nextProposalId,
            title: title,
            description: description,
            creator: self.account.address,
            endTime: endTime
        )
        self.proposals[self.nextProposalId] = proposal
        self.nextProposalId = self.nextProposalId + 1
    }

    pub fun vote(proposalId: UInt64, voteFor: Bool) {
        pre {
            self.proposals[proposalId] != nil: "Proposal does not exist"
            self.proposals[proposalId]?.endTime > getCurrentBlock().timestamp: "Voting period has ended"
        }

        let voter = self.account.address

        if self.hasVoted[voter] == nil {
            self.hasVoted[voter] = {}
        }

        if self.hasVoted[voter]![proposalId] ?? false {
            panic("Already voted on this proposal")
        }

        self.hasVoted[voter]![proposalId] = true

        if voteFor {
            self.proposals[proposalId]?.votesFor += 1
        } else {
            self.proposals[proposalId]?.votesAgainst += 1
        }
    }
}